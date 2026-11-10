#!/usr/bin/env python3
"""Fetches the self-hosted Echelon fonts from npm (owner decision 2026-11-09).

theme/echelon-fonts.json names each package, its exact version, the latin
WOFF2 subsets to take and where its OFL licence goes, and records the npm
tarball integrity and the sha256 of every file taken from it.

    python tools/fonts.py --check     # fetch, verify the record, and compare dist/fonts/
                                      # with the npm tarballs byte for byte (no writes)
    python tools/fonts.py --update    # fetch and re-record integrity and sha256

tools/build_theme.py calls `fetch_tarballs` and `resolve` for every build, so
the packaged fonts always come from the recorded npm tarballs and a changed
byte fails the build. Only `--update` writes the record, after a deliberate
version change in theme/echelon-fonts.json.

Everything except `fetch_tarballs`, `load_spec` and `main` is a pure function.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import io
import json
import pathlib
import re
import subprocess
import sys
import tarfile
import tempfile
from typing import Mapping, NamedTuple

ROOT = pathlib.Path(__file__).resolve().parents[1]
SPEC_PATH = ROOT / "theme/echelon-fonts.json"
FONT_DIR = "dist/fonts"
LICENSE_DIR = "dist/fonts/licenses"
WOFF2_MAGIC = b"wOF2"
OFL_TITLE = "SIL OPEN FONT LICENSE"


class FontError(Exception):
    pass


class Face(NamedTuple):
    package: str
    version: str
    family: str
    style: str
    weight: str
    member: str
    path: str
    unicode_range: str
    sha256: str
    bytes: int


class Resolved(NamedTuple):
    files: dict          # package-relative path -> bytes
    faces: tuple         # Face records, in spec order
    licenses: tuple      # dicts: package, version, path, member, sha256, bytes


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def integrity(data: bytes) -> str:
    """npm's Subresource Integrity string for a tarball."""
    return "sha512-" + base64.b64encode(hashlib.sha512(data).digest()).decode()


def face_path(member: str) -> str:
    return f"{FONT_DIR}/{pathlib.PurePosixPath(member).name}"


def read_member(tarball: bytes, member: str) -> bytes:
    """One file from an npm tarball (members live under package/). Nothing is extracted to disk."""
    if ".." in member.split("/") or member.startswith("/"):
        raise FontError(f"unsafe tarball member '{member}'")
    with tarfile.open(fileobj=io.BytesIO(tarball), mode="r:gz") as archive:
        try:
            info = archive.getmember(f"package/{member}")
        except KeyError as error:
            raise FontError(f"tarball has no member package/{member}") from error
        if not info.isfile():
            raise FontError(f"tarball member package/{member} is not a regular file")
        return archive.extractfile(info).read()


def unicode_range(css: str, block: str) -> str:
    """The unicode-range of the @font-face that fontsource labels `/* block */`."""
    match = re.search(r"/\*\s*" + re.escape(block) + r"\s*\*/\s*@font-face\s*\{([^}]*)\}", css)
    if not match:
        raise FontError(f"no @font-face labelled '{block}' in the package CSS")
    found = re.search(r"unicode-range:\s*([^;]+);", match.group(1))
    if not found:
        raise FontError(f"@font-face '{block}' has no unicode-range")
    return found.group(1).strip()


def _check(label: str, recorded: str, actual: str) -> list[str]:
    if not recorded:
        return [f"{label}: nothing recorded; run tools/fonts.py --update"]
    return [] if recorded == actual else [f"{label}: recorded {recorded}, fetched {actual}"]


def resolve(spec: Mapping, tarballs: Mapping[str, bytes]) -> Resolved:
    """Takes the listed files out of the fetched tarballs and verifies every
    recorded integrity and sha256. Raises FontError listing every mismatch."""
    problems: list[str] = []
    files: dict[str, bytes] = {}
    faces: list[Face] = []
    licenses: list[dict] = []
    for package in spec["packages"]:
        name, version = package["name"], package["version"]
        tarball = tarballs[name]
        problems += _check(f"{name}@{version} integrity", package.get("integrity", ""), integrity(tarball))
        meta = json.loads(read_member(tarball, "package.json"))
        if (meta.get("name"), meta.get("version")) != (name, version):
            problems.append(f"{name}@{version}: tarball is {meta.get('name')}@{meta.get('version')}")
        if meta.get("license") != spec["license"]:
            problems.append(f"{name}@{version}: license is {meta.get('license')}, expected {spec['license']}")

        licence = package["license"]
        text = read_member(tarball, licence["member"])
        if OFL_TITLE not in text.decode("utf-8", errors="replace").upper():
            problems.append(f"{name}@{version}: {licence['member']} is not the SIL Open Font License")
        problems += _check(f"{licence['path']} sha256", licence.get("sha256", ""), sha256(text))
        files[licence["path"]] = text
        licenses.append({"package": name, "version": version, "path": licence["path"],
                         "member": licence["member"], "sha256": sha256(text), "bytes": len(text)})

        for face in package["faces"]:
            data = read_member(tarball, face["member"])
            path = face_path(face["member"])
            if not data.startswith(WOFF2_MAGIC):
                problems.append(f"{name}@{version}: {face['member']} is not WOFF2")
            problems += _check(f"{path} sha256", face.get("sha256", ""), sha256(data))
            if path in files and files[path] != data:
                problems.append(f"two faces write different files to {path}")
            files[path] = data
            block = pathlib.PurePosixPath(face["member"]).stem
            css = read_member(tarball, face["css"]).decode()
            faces.append(Face(name, version, face["family"], face["style"], face["weight"],
                              face["member"], path, unicode_range(css, block), sha256(data), len(data)))
    if problems:
        raise FontError("font packages do not match theme/echelon-fonts.json:\n  " + "\n  ".join(problems))
    return Resolved(files, tuple(faces), tuple(licenses))


def record(spec: Mapping, tarballs: Mapping[str, bytes]) -> dict:
    """A copy of the spec with integrity and sha256 taken from the tarballs."""
    def package_record(package: Mapping) -> dict:
        tarball = tarballs[package["name"]]
        licence = {**package["license"], "sha256": sha256(read_member(tarball, package["license"]["member"]))}
        faces = [{**face, "sha256": sha256(read_member(tarball, face["member"]))} for face in package["faces"]]
        return {**package, "integrity": integrity(tarball), "license": licence, "faces": faces}
    return {**spec, "packages": [package_record(p) for p in spec["packages"]]}


def css_family(family: str) -> str:
    return '"' + family.replace("\\", "\\\\").replace('"', '\\"') + '"'


def render_css(faces: tuple, header: str) -> str:
    """dist/echelon-fonts.css: one @font-face per face, URLs relative to dist/."""
    blocks = [
        f"/* {face.package} {face.version}: {face.member} */\n"
        "@font-face {\n"
        f"  font-family: {css_family(face.family)};\n"
        f"  font-style: {face.style};\n"
        f"  font-weight: {face.weight};\n"
        "  font-display: swap;\n"
        f"  src: url(\"{face.path.removeprefix('dist/')}\") format(\"woff2\");\n"
        f"  unicode-range: {face.unicode_range};\n"
        "}\n"
        for face in faces
    ]
    return header + "\n" + "\n".join(blocks)


def manifest_fonts(resolved: Resolved) -> list[dict]:
    return [{"path": f.path, "mediaType": "font/woff2", "bytes": f.bytes, "sha256": f.sha256,
             "family": f.family, "style": f.style, "weight": f.weight,
             "package": f.package, "version": f.version, "source": f.member}
            for f in resolved.faces]


def manifest_licenses(resolved: Resolved) -> list[dict]:
    return [{"path": l["path"], "mediaType": "text/plain", "bytes": l["bytes"], "sha256": l["sha256"],
             "license": "OFL-1.1", "package": l["package"], "version": l["version"], "source": l["member"]}
            for l in resolved.licenses]


def manifest_packages(spec: Mapping) -> list[dict]:
    return [{"name": p["name"], "version": p["version"], "integrity": p["integrity"], "license": spec["license"]}
            for p in spec["packages"]]


def packaged_differences(resolved: Resolved, root: pathlib.Path) -> list[str]:
    """Files under dist/fonts/ that are missing, extra, or differ from the tarball bytes."""
    expected = resolved.files
    on_disk = {p.relative_to(root).as_posix() for p in (root / FONT_DIR).rglob("*") if p.is_file()} \
        if (root / FONT_DIR).is_dir() else set()
    missing = [f"{path}: missing" for path in sorted(set(expected) - on_disk)]
    extra = [f"{path}: not taken from any npm tarball" for path in sorted(on_disk - set(expected))]
    differ = [f"{path}: differs from the npm tarball" for path in sorted(set(expected) & on_disk)
              if (root / path).read_bytes() != expected[path]]
    return missing + extra + differ


def load_spec(path: pathlib.Path = SPEC_PATH) -> dict:
    return json.loads(path.read_text())


def fetch_tarballs(spec: Mapping) -> dict[str, bytes]:
    """`npm pack <name>@<version>` for each package, into a private temp dir."""
    tarballs = {}
    with tempfile.TemporaryDirectory(prefix="echelon-fonts-") as tmp:
        for package in spec["packages"]:
            ref = f"{package['name']}@{package['version']}"
            result = subprocess.run(["npm", "pack", ref, "--pack-destination", tmp, "--json", "--ignore-scripts"],
                                    capture_output=True, text=True, cwd=tmp)
            if result.returncode != 0:
                raise FontError(f"npm pack {ref} failed:\n{result.stdout}{result.stderr}")
            filename = json.loads(result.stdout)[0]["filename"]
            tarballs[package["name"]] = (pathlib.Path(tmp) / filename).read_bytes()
    return tarballs


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true", help="fetch and verify against theme/echelon-fonts.json")
    mode.add_argument("--update", action="store_true", help="fetch and re-record integrity and sha256")
    args = parser.parse_args(argv)
    try:
        spec = load_spec()
        tarballs = fetch_tarballs(spec)
        if args.update:
            updated = record(spec, tarballs)
            SPEC_PATH.write_text(json.dumps(updated, indent=2) + "\n")
            spec = updated
        resolved = resolve(spec, tarballs)
    except FontError as error:
        print(f"FAIL: {error}", file=sys.stderr)
        return 1
    if args.check:
        differences = packaged_differences(resolved, ROOT)
        if differences:
            print("FAIL: dist/fonts/ does not match the npm tarballs:\n  " + "\n  ".join(differences), file=sys.stderr)
            return 1
    for face in resolved.faces:
        print(f"{face.sha256}  {face.path}  ({face.package}@{face.version})")
    for licence in resolved.licenses:
        print(f"{licence['sha256']}  {licence['path']}  ({licence['package']}@{licence['version']})")
    print(f"PASS: {len(resolved.faces)} faces and {len(resolved.licenses)} licences match the npm tarballs"
          + (" and dist/fonts/ byte for byte" if args.check else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
