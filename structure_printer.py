import os
import re
from pathlib import Path

# Папки, которые не относятся к исходному коду и их нужно проигнорировать
IGNORE_DIRS = {
    'node_modules', '.git', 'dist', 'build', '.nx',
    'coverage', '.tmp', '.vscode', '.idea', 'public', 'assets'
}

# Расширения файлов, которые мы считаем "реальным кодом"
CODE_EXTENSIONS = {'.ts', '.tsx'}

def get_main_entity(filepath: Path) -> str:
    """
    Парсит файл и пытается найти главное название класса или интерфейса.
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

            # Регулярное выражение для поиска class или interface
            # Поддерживает: export class X, export default class X, abstract class X, interface Y и т.д.
            pattern = r'(?:export\s+)?(?:default\s+)?(?:abstract\s+)?(?:class|interface)\s+([A-Za-z0-9_]+)'
            matches = re.findall(pattern, content)

            if matches:
                # Возвращаем первое найденное имя (обычно оно и есть главное в файле)
                return matches[0]
    except Exception:
        # Если файл не читается или возникла ошибка, просто пропускаем
        pass

    return ""

def generate_tree(dir_path: Path, prefix: str = ""):
    """
    Рекурсивно строит и выводит дерево проекта.
    """
    try:
        # Получаем все элементы в директории
        items = list(dir_path.iterdir())
    except PermissionError:
        return

    # Отфильтровываем папки и файлы
    dirs = [d for d in items if d.is_dir() and d.name not in IGNORE_DIRS and not d.name.startswith('.')]
    files = [f for f in items if f.is_file() and f.suffix in CODE_EXTENSIONS]

    # Сортируем по алфавиту для красоты
    dirs.sort(key=lambda x: x.name)
    files.sort(key=lambda x: x.name)

    # Объединяем, чтобы папки шли первыми, а затем файлы
    all_items = dirs + files
    if not bool(prefix):
        root_dirs = ['libs', 'apps']
        # print(all_items[:2])
        all_items = list(filter(lambda i: str(i) in root_dirs, all_items))
        # print(all_items[:2])

    for i, item in enumerate(all_items):
        is_last = (i == len(all_items) - 1)
        connector = "└── " if is_last else "├── "

        if item.is_dir():
            print(f"{prefix}{connector}{item.name}/")
            # Рекурсивный вызов для вложенной папки с добавлением отступа
            new_prefix = prefix + ("    " if is_last else "│   ")
            generate_tree(item, new_prefix)
        else:
            entity = get_main_entity(item)
            # Если нашли класс/интерфейс, красиво добавляем его в скобках
            label = f" [{entity}]" if entity else ""
            print(f"{prefix}{connector}{item.name}{label}")

if __name__ == "__main__":
    # Указываем корень проекта (точка означает текущую директорию)
    project_root = Path(".")

    print(f"\n{project_root.resolve().name}/")
    generate_tree(project_root)