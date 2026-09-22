open System
open System.Collections.Generic
open System.Globalization
open System.IO
open System.Text
open System.Text.Json.Nodes

type Token =
    { Path: string list
      DeclaredType: string option
      Value: JsonNode }

let fail message =
    eprintfn "ERROR %s" message
    Environment.ExitCode <- 1
    raise (InvalidOperationException message)

let invariant (value: float) = value.ToString("0.###", CultureInfo.InvariantCulture)

let rec collectTokens (inheritedType: string option) (path: string list) (node: JsonNode) : Token list =
    match node with
    | :? JsonObject as obj ->
        let tokenType =
            match obj["$type"] with
            | null -> inheritedType
            | typeNode -> Some(typeNode.GetValue<string>())

        match obj["$value"] with
        | null ->
            obj
            |> Seq.choose (fun pair ->
                if pair.Key.StartsWith("$", StringComparison.Ordinal) || isNull pair.Value then None
                else Some(collectTokens tokenType (path @ [ pair.Key ]) pair.Value))
            |> Seq.concat
            |> Seq.toList
        | value ->
            [ { Path = path
                DeclaredType = tokenType
                Value = value } ]
    | _ -> []

let pathText path = String.concat "." path

let tryAlias (node: JsonNode) =
    match node with
    | :? JsonValue as value ->
        try
            let text = value.GetValue<string>()
            if text.StartsWith("{", StringComparison.Ordinal)
               && text.EndsWith("}", StringComparison.Ordinal)
               && text.Length > 2 then
                Some(text.Substring(1, text.Length - 2))
            else None
        with _ -> None
    | _ -> None

let cssName (segments: string list) =
    segments
    |> List.map (fun segment -> segment.Trim().ToLowerInvariant().Replace("_", "-").Replace(" ", "-"))
    |> String.concat "-"

let quoteFont (value: string) =
    let generic =
        set [ "serif"; "sans-serif"; "monospace"; "system-ui"; "ui-serif"; "ui-sans-serif"; "ui-monospace"; "cursive"; "fantasy" ]
    if generic.Contains(value.ToLowerInvariant()) then value
    elif value.Contains(" ") then $"\"{value}\""
    else value

let renderLiteral tokenType (value: JsonNode) =
    match tokenType with
    | "color" ->
        let obj = value.AsObject()
        match obj["hex"] with
        | null ->
            let components = obj["components"].AsArray() |> Seq.map (fun n -> n.GetValue<float>()) |> Seq.toArray
            if components.Length <> 3 then fail "color token requires three sRGB components"
            let toByte c = Math.Clamp(int (Math.Round(c * 255.0)), 0, 255)
            $"#{toByte components[0]:x2}{toByte components[1]:x2}{toByte components[2]:x2}"
        | hex -> hex.GetValue<string>().ToLowerInvariant()
    | "dimension"
    | "duration" ->
        let obj = value.AsObject()
        let number = obj["value"].GetValue<float>() |> invariant
        let unitName = obj["unit"].GetValue<string>()
        number + unitName
    | "cubicBezier" ->
        let values = value.AsArray() |> Seq.map (fun n -> n.GetValue<float>() |> invariant)
        $"cubic-bezier({String.concat ", " values})"
    | "fontFamily" ->
        match value with
        | :? JsonArray as arr ->
            arr |> Seq.map (fun n -> n.GetValue<string>() |> quoteFont) |> String.concat ", "
        | _ -> value.GetValue<string>() |> quoteFont
    | "fontWeight"
    | "number" ->
        value.GetValue<float>() |> invariant
    | other -> fail $"unsupported token type '{other}'"

let parseHex (hex: string) =
    let text = hex.TrimStart('#')
    if text.Length <> 6 then fail $"contrast validation requires six-digit hex, got '{hex}'"
    let part offset = Convert.ToInt32(text.Substring(offset, 2), 16)
    part 0, part 2, part 4

let linearize channel =
    let c = float channel / 255.0
    if c <= 0.04045 then c / 12.92
    else Math.Pow((c + 0.055) / 1.055, 2.4)

let luminance hex =
    let r, g, b = parseHex hex
    0.2126 * linearize r + 0.7152 * linearize g + 0.0722 * linearize b

let contrast a b =
    let x, y = luminance a, luminance b
    (max x y + 0.05) / (min x y + 0.05)

[<EntryPoint>]
let main argv =
    try
        if argv.Length <> 2 then
            fail "usage: TokenCompiler <tokens.json> <output.css>"

        let sourcePath = Path.GetFullPath argv[0]
        let outputPath = Path.GetFullPath argv[1]
        let root = JsonNode.Parse(File.ReadAllText sourcePath)
        if isNull root then fail "token source is empty"

        let tokens = collectTokens None [] root
        if tokens.IsEmpty then fail "token source contains no tokens"

        let byPath = Dictionary<string, Token>(StringComparer.Ordinal)
        for token in tokens do
            let key = pathText token.Path
            if byPath.ContainsKey key then fail $"duplicate token path '{key}'"
            byPath[key] <- token

        let rec resolveType stack (token: Token) =
            match token.DeclaredType with
            | Some t -> t
            | None ->
                match tryAlias token.Value with
                | Some alias ->
                    if stack |> List.contains alias then fail $"circular token reference involving '{alias}'"
                    match byPath.TryGetValue alias with
                    | true, target -> resolveType (alias :: stack) target
                    | _ -> fail $"unknown token reference '{{{alias}}}'"
                | None -> fail $"token '{pathText token.Path}' has no type"

        let rec resolveCss stack (token: Token) =
            let key = pathText token.Path
            if stack |> List.contains key then fail $"circular token reference involving '{key}'"
            match tryAlias token.Value with
            | Some alias ->
                match byPath.TryGetValue alias with
                | true, target -> resolveCss (key :: stack) target
                | _ -> fail $"unknown token reference '{{{alias}}}'"
            | None -> renderLiteral (resolveType stack token) token.Value

        let semantic theme =
            tokens
            |> List.choose (fun token ->
                match token.Path with
                | "semantic" :: actualTheme :: rest when actualTheme = theme && not rest.IsEmpty ->
                    Some("--ef-" + cssName rest, resolveCss [] token)
                | _ -> None)
            |> List.sortBy fst

        let light = semantic "light"
        let dark = semantic "dark"

        let lightNames = light |> List.map fst |> Set.ofList
        let darkNames = dark |> List.map fst |> Set.ofList
        if lightNames <> darkNames then
            let missingDark = Set.difference lightNames darkNames |> String.concat ", "
            let missingLight = Set.difference darkNames lightNames |> String.concat ", "
            fail $"theme variable mismatch; missing dark=[{missingDark}] missing light=[{missingLight}]"

        let resolved key =
            match byPath.TryGetValue key with
            | true, token -> resolveCss [] token
            | _ -> fail $"missing required token '{key}'"

        let contrastChecks =
            [ "light primary text", "semantic.light.color.text.primary", "semantic.light.color.surface.primary", 4.5
              "light secondary text", "semantic.light.color.text.secondary", "semantic.light.color.surface.primary", 4.5
              "light secondary-surface text", "semantic.light.color.text.on-secondary-surface", "semantic.light.color.surface.secondary", 4.5
              "light primary accent", "semantic.light.color.accent.primary", "semantic.light.color.surface.primary", 4.5
              "light secondary accent", "semantic.light.color.accent.secondary", "semantic.light.color.surface.primary", 4.5
              "dark primary text", "semantic.dark.color.text.primary", "semantic.dark.color.surface.primary", 4.5
              "dark secondary text", "semantic.dark.color.text.secondary", "semantic.dark.color.surface.primary", 4.5
              "dark secondary-surface text", "semantic.dark.color.text.on-secondary-surface", "semantic.dark.color.surface.secondary", 4.5
              "dark primary accent", "semantic.dark.color.accent.primary", "semantic.dark.color.surface.primary", 4.5
              "dark secondary accent", "semantic.dark.color.accent.secondary", "semantic.dark.color.surface.primary", 4.5
              "light focus ring", "semantic.light.color.focus.ring", "semantic.light.color.surface.primary", 3.0
              "dark focus ring", "semantic.dark.color.focus.ring", "semantic.dark.color.surface.primary", 3.0 ]

        for name, foreground, background, minimum in contrastChecks do
            let ratio = contrast (resolved foreground) (resolved background)
            if ratio + 0.0001 < minimum then
                fail $"{name} contrast {ratio:F2}:1 is below required {minimum:F1}:1"

        let neutral =
            tokens
            |> List.choose (fun token ->
                match token.Path with
                | "semantic" :: _ -> None
                | path -> Some("--ef-" + cssName path, resolveCss [] token))
            |> List.sortBy fst

        let writeBlock (builder: StringBuilder) selector values =
            builder.AppendLine(selector + " {") |> ignore
            for name, value in values do
                builder.AppendLine($"  {name}: {value};") |> ignore
            builder.AppendLine("}") |> ignore

        let css = StringBuilder()
        css.AppendLine("/* Generated from tokens/echelon.tokens.json. Do not edit directly. */") |> ignore
        css.AppendLine("@layer echelon.tokens {") |> ignore
        writeBlock css "  :root" neutral
        writeBlock css "  :root, [data-ef-theme=\"light\"]" light
        css.AppendLine("  @media (prefers-color-scheme: dark) {") |> ignore
        writeBlock css "    :root:not([data-ef-theme])" dark
        css.AppendLine("  }") |> ignore
        writeBlock css "  [data-ef-theme=\"dark\"]" dark
        css.AppendLine("}") |> ignore

        Directory.CreateDirectory(Path.GetDirectoryName outputPath) |> ignore
        File.WriteAllText(outputPath, css.ToString().Replace("\r\n", "\n"))

        printfn "token compilation passed: %d tokens, %d semantic variables per theme" tokens.Length light.Length
        0
    with ex ->
        if Environment.ExitCode = 0 then eprintfn "ERROR %s" ex.Message
        1
