import json
import random

# Ruta del archivo JSON
archivo_json = "livros_db.livros.json"

# Leer los datos del archivo JSON
with open(archivo_json, "r", encoding="utf-8") as archivo:
    libros = json.load(archivo)

# Actualizar los datos
for libro in libros:
    if libro.get("preco") == 0:
        libro["preco"] = random.randint(100, 500)
    if libro.get("numeroPaginas") == 0:
        libro["numeroPaginas"] = random.randint(100, 500)

# Guardar los datos actualizados en el mismo archivo
with open(archivo_json, "w", encoding="utf-8") as archivo:
    json.dump(libros, archivo, ensure_ascii=False, indent=4)

print("Archivo actualizado correctamente.")
