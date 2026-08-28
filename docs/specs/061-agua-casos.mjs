// Prueba las funciones puras de js/agua.js, sin el import de Firebase.
import fs from "node:fs";

const fuente = fs.readFileSync("js/agua.js", "utf8");
const puro = fuente
  .replace(/^import[\s\S]*?from\s+"[^"]+";\s*$/gm, "")
  .replace(/^export (async )?function (documentoDe|coleccionDeAgua|leerVasosDe|guardarVasos)[\s\S]*?\n}\n/gm, "")
  .replace(/^function documentoDe[\s\S]*?\n}\n/gm, "");

const m = await import(
  "data:text/javascript;base64," + Buffer.from(puro, "utf8").toString("base64")
);

const { normalizarVasos, objetivoDeVasos, validarObjetivo, MAXIMO_VASOS } = m;

let mal = 0;
const ok = (nombre, real, esperado) => {
  const bien = JSON.stringify(real) === JSON.stringify(esperado);
  if (!bien) {
    mal++;
    console.log(`MAL  ${nombre}: ${JSON.stringify(real)} (esperado ${JSON.stringify(esperado)})`);
  }
};

// normalizarVasos: nada raro puede llegar a la pantalla
ok("vasos normales", normalizarVasos(5), 5);
ok("vasos ausentes", normalizarVasos(undefined), 0);
ok("vasos nulos", normalizarVasos(null), 0);
ok("vasos texto basura", normalizarVasos("hola"), 0);
ok("vasos negativos", normalizarVasos(-3), 0);
ok("vasos con decimales", normalizarVasos(3.7), 3);
ok("vasos por encima del tope", normalizarVasos(999), MAXIMO_VASOS);
ok("vasos como texto numerico", normalizarVasos("4"), 4);

// objetivoDeVasos: siempre un numero usable
ok("objetivo sin ajustes", objetivoDeVasos(undefined), 8);
ok("objetivo sin campo", objetivoDeVasos({}), 8);
ok("objetivo puesto", objetivoDeVasos({ vasosObjetivo: 12 }), 12);
ok("objetivo cero", objetivoDeVasos({ vasosObjetivo: 0 }), 8);
ok("objetivo enorme", objetivoDeVasos({ vasosObjetivo: 500 }), 8);
ok("objetivo con decimales", objetivoDeVasos({ vasosObjetivo: 8.5 }), 8);
ok("objetivo null", objetivoDeVasos({ vasosObjetivo: null }), 8);

// validarObjetivo
ok("valida 8", validarObjetivo("8"), { objetivo: 8 });
ok("valida con espacios", validarObjetivo("  10 "), { objetivo: 10 });
ok("rechaza vacio", "error" in validarObjetivo(""), true);
ok("rechaza cero", "error" in validarObjetivo("0"), true);
ok("rechaza 21", "error" in validarObjetivo("21"), true);
ok("rechaza decimal", "error" in validarObjetivo("8,5"), true);
ok("rechaza texto", "error" in validarObjetivo("ocho"), true);
ok("acepta el minimo", validarObjetivo("1"), { objetivo: 1 });
ok("acepta el maximo", validarObjetivo("20"), { objetivo: 20 });

console.log(mal === 0 ? "Todas las pruebas de agua pasan." : `${mal} fallos.`);
