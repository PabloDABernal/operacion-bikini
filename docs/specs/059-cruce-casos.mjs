const norm = (s) =>
  String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const casa = (linea, ing) =>
  new RegExp("\\b" + escapar(norm(ing)) + "(es|s)?\\b").test(norm(linea));

// Casos del cruce despensa/receta de la spec 059.
// Se ejecuta con: node docs/specs/059-cruce-casos.mjs
// Al implementar la 059, estos casos van a un test de verdad.
const pruebas = [
  ["2 tomates maduros", "tomate", true, "plural, el caso normal"],
  ["1 tomate", "tomate", true, "singular exacto"],
  ["salmon a la plancha", "sal", false, "EL filo: sal dentro de salmon"],
  ["salmón a la plancha", "sal", false, "lo mismo con tilde"],
  ["sal al gusto", "sal", true, "sal de verdad"],
  ["100 g de lentejas", "lenteja", true, "plural en -s"],
  ["ajos tiernos", "ajo", true, "plural en -s"],
  ["aceite de oliva", "ajo", false, "ajo no está"],
  ["pimiento rojo", "pimiento", true, "el tuyo es más corto que la línea"],
  ["2 coliflores", "coliflor", true, "plural en -es"],
  ["arroz redondo", "arroz", true, "acaba en z"],
  ["mix de verduras congelado", "verdura", true, "tu ingrediente dentro de una frase larga"],
  ["verduras congeladas", "mix de verduras congelado", false, "al reves no: tu despensa dice mas que la receta"],
  ["harina de trigo", "harina", true, "primera palabra"],
  ["leche entera", "lechuga", false, "prefijo parecido, no es"],
  ["pechuga de pollo", "pollo", true, "última palabra"],
  ["Tomate", "tomate", true, "mayúsculas"],
  ["  TOMATES  ", "Tomate", true, "espacios y mayúsculas"]
];

let mal = 0;
for (const [linea, ing, esperado, nota] of pruebas) {
  const r = casa(linea, ing);
  const bien = r === esperado;
  if (!bien) mal++;
  console.log(
    `${bien ? "OK " : "MAL"}  "${ing}" en "${linea}" -> ${r}   (${nota})`
  );
}
console.log(mal === 0 ? "\nTodas pasan." : `\n${mal} fallos.`);
