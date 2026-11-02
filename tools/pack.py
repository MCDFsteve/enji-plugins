#!/usr/bin/env python3
"""Packs each plugin of plugins/ into dist/<id>-<version>.enj (a zip of its
folder, pack.json at the root) and writes plugins.json, the market's index:
each plugin's declaration and where its package is.

usage: python3 tools/pack.py
"""
import json
import pathlib
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
REQUIRED = ("id", "name", "version", "main")


def main():
    dist = ROOT / "dist"
    dist.mkdir(exist_ok=True)
    for old in dist.glob("*.enj"):
        old.unlink()
    listed = []
    for folder in sorted((ROOT / "plugins").iterdir()):
        pack_file = folder / "pack.json"
        if not pack_file.is_file():
            continue
        pack = json.loads(pack_file.read_text(encoding="utf-8"))
        missing = [key for key in REQUIRED if not pack.get(key)]
        if missing:
            raise SystemExit(f"{folder.name}: pack.json lacks {', '.join(missing)}")
        if pack["id"] != folder.name:
            raise SystemExit(f"{folder.name}: the folder is not named by the id {pack['id']}")
        if not (folder / pack["main"]).is_file():
            raise SystemExit(f"{folder.name}: no script {pack['main']}")
        package = dist / f"{pack['id']}-{pack['version']}.enj"
        with zipfile.ZipFile(package, "w", zipfile.ZIP_DEFLATED) as archive:
            for path in sorted(folder.rglob("*")):
                if path.is_file() and not path.name.startswith("."):
                    archive.write(path, path.relative_to(folder).as_posix())
        listed.append({**pack, "package": package.relative_to(ROOT).as_posix(), "path": folder.relative_to(ROOT).as_posix()})
        print(f"packed {package.relative_to(ROOT)}")
    index = {"version": 1, "plugins": listed}
    (ROOT / "plugins.json").write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote plugins.json ({len(listed)} plugins)")


if __name__ == "__main__":
    main()
