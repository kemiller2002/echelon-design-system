open System
open System.IO
open System.Text
open System.Text.Json
open System.Text.Json.Nodes
open System.Text.RegularExpressions

let fail message =
    eprintfn "ERROR %s" message
    Environment.ExitCode <- 1
    raise (InvalidOperationException message)

let requireObject (parent: JsonObject) name =
    match parent[name] with
    | :? JsonObject as value -> value
    | _ -> fail $"missing required object '{name}'"

let requireString (parent: JsonObject) name =
    match parent[name] with
    | :? JsonValue as value ->
        try
            let text = value.GetValue<string>()
            if String.IsNullOrWhiteSpace text then fail $"'{name}' must not be empty"
            text
        with _ -> fail $"'{name}' must be a string"
    | _ -> fail $"missing required string '{name}'"

let tryObject (parent: JsonObject) name =
    match parent[name] with
    | :? JsonObject as value -> Some value
    | _ -> None

let tryNode (parent: JsonObject) name =
    match parent[name] with
    | null -> None
    | value -> Some value

let pathText segments = pathText segments

let getPath (root: JsonObject) (segments: string list) =
    let mutable current: JsonNode = root
    for segment in segments do
        match current with
        | :? JsonObject as obj when not (isNull obj[segment]) -> current <- obj[segment]
        | _ -> fail $"missing required value '{pathText segments}'"
    current

let getStringPath root path =
    match getPath root path with
    | :? JsonValue as value ->
        try value.GetValue<string>()
        with _ -> fail $"'{pathText path}' must be a string"
    | _ -> fail $"'{pathText path}' must be a string"

let parseHex (hex: string) =
    if not (Regex.IsMatch(hex, "^#[0-9A-Fa-f]{6}$")) then
        fail $"expected six-digit hex color, got '{hex}'"
    let text = hex.Substring(1)
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

let ensureContrast name foreground background minimum =
    let ratio = contrast foreground background
    if ratio + 0.0001 < minimum then
        fail $"{name} contrast {ratio:F2}:1 is below required {minimum:F1}:1"

let genericFonts =
    set [ "serif"; "sans-serif"; "monospace"; "system-ui"; "ui-serif"; "ui-sans-serif"; "ui-monospace"; "cursive"; "fantasy" ]

let safeFontName (value: string) =
    if not (Regex.IsMatch(value, "^[A-Za-z0-9 ._-]+$")) then
        fail $"unsafe font-family value '{value}'"
    if genericFonts.Contains(value.ToLowerInvariant()) then value
    elif value.Contains(" ") then $"\"{value}\""
    else value

let renderFont (node: JsonNode) =
    match node with
    | :? JsonArray as arr ->
        if arr.Count = 0 then fail "font-family arrays must not be empty"
        arr
        |> Seq.map (fun item ->
            if isNull item then fail "font-family entries must be strings"
            item.GetValue<string>() |> safeFontName)
        |> String.concat ", "
    | :? JsonValue as value -> value.GetValue<string>() |> safeFontName
    | _ -> fail "font-family must be a string or array of strings"

let safeDimension name value =
    if not (Regex.IsMatch(value, "^(0|[0-9]+(?:\\.[0-9]+)?(?:px|rem|em))$")) then
        fail $"'{name}' must be a non-negative px/rem/em dimension"
    value

let semanticPaths =
    [ "color.text.primary", [ "color"; "text"; "primary" ]
      "color.text.heading", [ "color"; "text"; "heading" ]
      "color.text.secondary", [ "color"; "text"; "secondary" ]
      "color.text.on-secondary-surface", [ "color"; "text"; "on-secondary-surface" ]
      "color.text.inverse", [ "color"; "text"; "inverse" ]
      "color.surface.primary", [ "color"; "surface"; "primary" ]
      "color.surface.secondary", [ "color"; "surface"; "secondary" ]
      "color.surface.inverse", [ "color"; "surface"; "inverse" ]
      "color.surface.inverse-secondary", [ "color"; "surface"; "inverse-secondary" ]
      "color.accent.primary", [ "color"; "accent"; "primary" ]
      "color.accent.secondary", [ "color"; "accent"; "secondary" ]
      "color.border.subtle", [ "color"; "border"; "subtle" ]
      "color.border.functional", [ "color"; "border"; "functional" ]
      "color.focus.ring", [ "color"; "focus"; "ring" ]
      "color.focus.gap", [ "color"; "focus"; "gap" ]
      "color.control.track", [ "color"; "control"; "track" ]
      "color.control.thumb", [ "color"; "control"; "thumb" ]
      "color.control.active", [ "color"; "control"; "active" ] ]

let cssName path = "--ef-" + path.Replace(".", "-")

let readTheme (themes: JsonObject) themeName =
    let theme = requireObject themes themeName
    semanticPaths
    |> List.map (fun (name, path) ->
        let value = getStringPath theme path
        parseHex value |> ignore
        cssName name, value.ToLowerInvariant())

let valueByCssName name values =
    match values |> List.tryFind (fun (key, _) -> key = name) with
    | Some (_, value) -> value
    | None -> fail $"missing generated semantic value '{name}'"

let validateTheme themeName values =
    let value name = valueByCssName name values
    let surface = value "--ef-color-surface-primary"
    ensureContrast $"{themeName} primary text" (value "--ef-color-text-primary") surface 4.5
    ensureContrast $"{themeName} secondary text" (value "--ef-color-text-secondary") surface 4.5
    ensureContrast $"{themeName} secondary-surface text" (value "--ef-color-text-on-secondary-surface") (value "--ef-color-surface-secondary") 4.5
    ensureContrast $"{themeName} primary accent" (value "--ef-color-accent-primary") surface 4.5
    ensureContrast $"{themeName} secondary accent" (value "--ef-color-accent-secondary") surface 4.5
    ensureContrast $"{themeName} inverse text" (value "--ef-color-text-inverse") (value "--ef-color-surface-inverse") 4.5
    ensureContrast $"{themeName} focus ring" (value "--ef-color-focus-ring") surface 3.0

let optionalPresentation (root: JsonObject) =
    match tryObject root "presentation" with
    | None -> []
    | Some presentation ->
        let values = ResizeArray<string * string>()
        match tryObject presentation "fontFamily" with
        | Some fonts ->
            for name in [ "display"; "sans"; "mono" ] do
                match tryNode fonts name with
                | Some node -> values.Add(($"--ef-primitive-font-family-{name}", renderFont node))
                | None -> ()
        | None -> ()
        match tryObject presentation "radius" with
        | Some radius ->
            for name in [ "small"; "medium"; "pill" ] do
                match tryNode radius name with
                | Some node ->
                    let raw = node.GetValue<string>()
                    values.Add(($"--ef-primitive-radius-{name}", safeDimension $"presentation.radius.{name}" raw))
                | None -> ()
        | None -> ()
        values |> Seq.toList

let writeBlock (builder: StringBuilder) selector values =
    builder.AppendLine(selector + " {") |> ignore
    for name, value in values do
        builder.AppendLine($"  {name}: {value};") |> ignore
    builder.AppendLine("}") |> ignore

let compileBrand outputDir sourcePath =
    let parsed = JsonNode.Parse(File.ReadAllText sourcePath)
    let root =
        match parsed with
        | :? JsonObject as value -> value
        | _ -> fail $"brand manifest '{sourcePath}' must contain a JSON object"

    let schemaVersion = requireString root "schemaVersion"
    if schemaVersion <> "1.0" then fail $"unsupported brand manifest schemaVersion '{schemaVersion}'"

    let id = requireString root "id"
    if not (Regex.IsMatch(id, "^[a-z0-9][a-z0-9-]*$")) then
        fail $"brand id '{id}' must match ^[a-z0-9][a-z0-9-]*$"

    let identity = requireObject root "identity"
    let name = requireString identity "name"
    let themes = requireObject root "themes"
    let light = readTheme themes "light"
    let dark = readTheme themes "dark"
    validateTheme "light" light
    validateTheme "dark" dark
    let presentation = optionalPresentation root

    let css = StringBuilder()
    css.AppendLine($"/* Generated from {Path.GetFileName sourcePath}. Do not edit directly. */") |> ignore
    css.AppendLine("@layer echelon.brand {") |> ignore
    writeBlock css $"  [data-ef-brand=\"{id}\"]" (presentation @ light)
    writeBlock css $"  [data-ef-theme=\"light\"] [data-ef-brand=\"{id}\"], [data-ef-brand=\"{id}\"][data-ef-theme=\"light\"]" light
    writeBlock css $"  [data-ef-theme=\"dark\"] [data-ef-brand=\"{id}\"], [data-ef-brand=\"{id}\"][data-ef-theme=\"dark\"]" dark
    css.AppendLine("  @media (prefers-color-scheme: dark) {") |> ignore
    writeBlock css $"    :root:not([data-ef-theme]) [data-ef-brand=\"{id}\"]:not([data-ef-theme]), :root[data-ef-brand=\"{id}\"]:not([data-ef-theme])" dark
    css.AppendLine("  }") |> ignore
    css.AppendLine("}") |> ignore

    Directory.CreateDirectory(outputDir) |> ignore
    let outputPath = Path.Combine(outputDir, id + ".css")
    File.WriteAllText(outputPath, css.ToString().Replace("\r\n", "\n"))
    printfn "brand compilation passed: %s (%s) -> %s" id name outputPath
    id, name, Path.GetFileName(sourcePath)

[<EntryPoint>]
let main argv =
    try
        if argv.Length <> 2 then fail "usage: BrandCompiler <brand-directory> <output-directory>"
        let sourceDir = Path.GetFullPath argv[0]
        let outputDir = Path.GetFullPath argv[1]
        if not (Directory.Exists sourceDir) then fail $"brand directory does not exist: {sourceDir}"

        let files = Directory.GetFiles(sourceDir, "*.brand.json", SearchOption.TopDirectoryOnly) |> Array.sort
        if files.Length = 0 then fail $"brand directory contains no *.brand.json files: {sourceDir}"

        Directory.CreateDirectory(outputDir) |> ignore
        for oldFile in Directory.GetFiles(outputDir, "*.css", SearchOption.TopDirectoryOnly) do
            File.Delete(oldFile)

        let compiled = files |> Array.map (compileBrand outputDir)
        let index = JsonArray()
        for id, name, source in compiled do
            let item = JsonObject()
            item["id"] <- JsonValue.Create(id)
            item["name"] <- JsonValue.Create(name)
            item["source"] <- JsonValue.Create(source)
            item["css"] <- JsonValue.Create(id + ".css")
            index.Add(item)
        let indexRoot = JsonObject()
        indexRoot["schemaVersion"] <- JsonValue.Create("1.0")
        indexRoot["brands"] <- index
        let options = JsonSerializerOptions(WriteIndented = true)
        File.WriteAllText(Path.Combine(outputDir, "index.json"), indexRoot.ToJsonString(options) + "\n")
        0
    with ex ->
        if Environment.ExitCode = 0 then eprintfn "ERROR %s" ex.Message
        1
