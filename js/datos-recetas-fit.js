// Recetas "fit" (postres altos en proteína, queso cottage, tiramisús fit y
// similares), pedidas por el usuario el 23 de septiembre de 2026 a partir de
// una búsqueda web de recetas populares de ese estilo. Mismo formato que
// RECETAS de js/datos-iniciales.js (spec 075), para reutilizar el mismo
// patrón de siembra/enlazado con el catálogo compartido.
//
// A diferencia de datos-iniciales.js, aquí `preparacion` es SIEMPRE un
// string (no un array de pasos): datos-iniciales.js arrastra un fallo previo
// a la spec 104 —sus recetas guardan `preparacion` como array y toda la app
// lo trata como texto (`.textContent =`, `.value =`)— y no hace falta
// repetirlo en datos nuevos. Anotado en docs/BACKLOG.md.

export const RECETAS_FIT = [
  {
    nombre: "Tiramisú fit de queso cottage",
    raciones: 6,
    ingredientesEnPiezas: [
      { ingrediente: "Queso cottage", cantidad: "400 g", preparacion: "escurrido" },
      { ingrediente: "Leche", cantidad: "6 cucharadas", preparacion: "" },
      { ingrediente: "Miel", cantidad: "2 cucharadas", preparacion: "" },
      { ingrediente: "Esencia de vainilla", cantidad: "1 cucharadita", preparacion: "" },
      { ingrediente: "Café", cantidad: "150 ml", preparacion: "frío" },
      { ingrediente: "Bizcochos de soletilla", cantidad: "18 unidades", preparacion: "" },
      { ingrediente: "Cacao en polvo", cantidad: "1 cucharada", preparacion: "" }
    ],
    preparacion:
      "Escurre bien el queso cottage y bátelo en la batidora con la leche, la miel y la vainilla hasta que quede una crema fina. Moja cada bizcocho brevemente en el café frío y coloca una capa en un molde rectangular; cubre con un tercio de la crema y repite dos veces más. Tapa y refrigera al menos 4 horas (mejor toda la noche), y espolvorea cacao por encima antes de servir.",
    alias: ["Tiramisú de queso cottage", "Tiramisú proteico"]
  },
  {
    nombre: "Tiramisú fit de café con yogur griego",
    raciones: 4,
    ingredientesEnPiezas: [
      { ingrediente: "Yogur griego", cantidad: "300 g", preparacion: "" },
      { ingrediente: "Queso cottage", cantidad: "150 g", preparacion: "escurrido y batido" },
      { ingrediente: "Miel", cantidad: "2 cucharadas", preparacion: "" },
      { ingrediente: "Café", cantidad: "150 ml", preparacion: "frío, sin azúcar" },
      { ingrediente: "Avena", cantidad: "4 cucharadas", preparacion: "" },
      { ingrediente: "Cacao en polvo", cantidad: "1 cucharada", preparacion: "" }
    ],
    preparacion:
      "Mezcla la avena con el café frío y deja que repose unos minutos hasta ablandarse: será la base, en vez de los bizcochos. Bate el yogur griego con el queso cottage batido y la miel hasta obtener una crema lisa. Monta en vasos individuales alternando la base de avena con café y la crema, termina con la crema arriba y espolvorea cacao antes de servir.",
    alias: []
  },
  {
    nombre: "Cheesecake proteico de queso cottage",
    raciones: 6,
    ingredientesEnPiezas: [
      { ingrediente: "Queso cottage", cantidad: "200 g", preparacion: "" },
      { ingrediente: "Queso crema", cantidad: "100 g", preparacion: "light" },
      { ingrediente: "Huevos", cantidad: "2 unidades", preparacion: "" },
      { ingrediente: "Edulcorante", cantidad: "al gusto", preparacion: "" }
    ],
    preparacion:
      "Tritura el queso cottage con el queso crema, los huevos y el edulcorante hasta que quede una masa homogénea. Vierte en un molde y hornea a 175 °C durante 30 minutos: los primeros 25 tapado con papel de aluminio, los últimos 5 destapado. Deja atemperar y refrigera unas horas (o toda la noche) antes de desmoldar.",
    alias: []
  },
  {
    nombre: "Tarta de queso cottage al horno",
    raciones: 6,
    ingredientesEnPiezas: [
      { ingrediente: "Queso cottage", cantidad: "250 g", preparacion: "" },
      { ingrediente: "Huevos", cantidad: "2 unidades", preparacion: "" },
      { ingrediente: "Yogur griego", cantidad: "125 g", preparacion: "" },
      { ingrediente: "Miel", cantidad: "2 cucharadas", preparacion: "" },
      { ingrediente: "Esencia de vainilla", cantidad: "1 cucharadita", preparacion: "" },
      { ingrediente: "Harina de avena", cantidad: "50 g", preparacion: "" }
    ],
    preparacion:
      "Bate los huevos con la miel, añade el queso cottage, el yogur, la vainilla y la harina de avena, y mezcla hasta que quede una crema sin grumos. Vierte en un molde forrado y hornea a 180 °C durante 30-35 minutos, hasta que cuaje. Deja enfriar del todo antes de desmoldar.",
    alias: []
  },
  {
    nombre: "Helado de queso cottage sin azúcar",
    raciones: 4,
    ingredientesEnPiezas: [
      { ingrediente: "Queso cottage", cantidad: "200 g", preparacion: "" },
      { ingrediente: "Yogur griego", cantidad: "100 g", preparacion: "sin azúcar" },
      { ingrediente: "Leche", cantidad: "50 ml", preparacion: "" },
      { ingrediente: "Edulcorante", cantidad: "2 cucharadas", preparacion: "" },
      { ingrediente: "Esencia de vainilla", cantidad: "1 cucharadita", preparacion: "" }
    ],
    preparacion:
      "Bate todos los ingredientes juntos hasta que quede una crema fina. Vierte en un recipiente apto para congelador y congela 3-4 horas, removiendo cada 30-40 minutos para que no se formen cristales grandes.",
    alias: []
  },
  {
    nombre: "Mousse de frutos rojos con queso cottage",
    raciones: 2,
    ingredientesEnPiezas: [
      { ingrediente: "Queso cottage", cantidad: "150 g", preparacion: "" },
      { ingrediente: "Frutos rojos", cantidad: "100 g", preparacion: "" },
      { ingrediente: "Miel", cantidad: "1 cucharada", preparacion: "" },
      { ingrediente: "Esencia de vainilla", cantidad: "1/2 cucharadita", preparacion: "" },
      { ingrediente: "Yogur griego", cantidad: "50 g", preparacion: "" }
    ],
    preparacion:
      "Tritura el queso cottage con los frutos rojos, la miel y la vainilla hasta que quede cremoso. Añade el yogur griego y mezcla con cuidado. Refrigera al menos 30 minutos antes de servir.",
    alias: []
  },
  {
    nombre: "Peras al horno con queso cottage y miel",
    raciones: 3,
    ingredientesEnPiezas: [
      { ingrediente: "Peras", cantidad: "3 unidades", preparacion: "maduras" },
      { ingrediente: "Queso cottage", cantidad: "100 g", preparacion: "" },
      { ingrediente: "Miel", cantidad: "1 cucharada", preparacion: "" },
      { ingrediente: "Canela", cantidad: "1/2 cucharadita", preparacion: "" },
      { ingrediente: "Nueces", cantidad: "1 cucharada", preparacion: "picadas" },
      { ingrediente: "Esencia de vainilla", cantidad: "1/2 cucharadita", preparacion: "" }
    ],
    preparacion:
      "Corta las peras por la mitad y retira el centro con una cuchara. Mezcla el queso cottage con la vainilla y rellena cada mitad. Hornea a 180 °C durante 20 minutos, y al sacarlas riega con la miel y reparte las nueces picadas por encima.",
    alias: []
  },
  {
    nombre: "Buñuelos de queso cottage",
    raciones: 4,
    ingredientesEnPiezas: [
      { ingrediente: "Queso cottage", cantidad: "200 g", preparacion: "" },
      { ingrediente: "Huevos", cantidad: "1 unidad", preparacion: "" },
      { ingrediente: "Harina de avena", cantidad: "80 g", preparacion: "" },
      { ingrediente: "Levadura", cantidad: "1/2 cucharadita", preparacion: "" },
      { ingrediente: "Miel", cantidad: "2 cucharadas", preparacion: "" },
      { ingrediente: "Esencia de vainilla", cantidad: "1 cucharadita", preparacion: "" },
      { ingrediente: "Canela", cantidad: "1/2 cucharadita", preparacion: "" }
    ],
    preparacion:
      "Mezcla todos los ingredientes hasta formar una masa espesa. Forma bolitas con las manos o dos cucharas y fríe en aceite caliente 2-3 minutos por lado, hasta que doren. Escurre sobre papel absorbente antes de servir.",
    alias: []
  },
  {
    nombre: "Tortitas de avena y queso cottage",
    raciones: 1,
    ingredientesEnPiezas: [
      { ingrediente: "Queso cottage", cantidad: "100 g", preparacion: "" },
      { ingrediente: "Avena", cantidad: "50 g", preparacion: "molida" },
      { ingrediente: "Huevos", cantidad: "1 unidad", preparacion: "" },
      { ingrediente: "Esencia de vainilla", cantidad: "1 cucharadita", preparacion: "" },
      { ingrediente: "Levadura", cantidad: "1/2 cucharadita", preparacion: "" },
      { ingrediente: "Miel", cantidad: "1 cucharada", preparacion: "" }
    ],
    preparacion:
      "Mezcla todos los ingredientes hasta obtener una masa homogénea. Cocina en una sartén antiadherente a fuego medio, 2-3 minutos por lado, hasta que doren. Sirve con fruta o un poco más de miel por encima.",
    alias: []
  },
  {
    nombre: "Tostada de queso cottage y aguacate",
    raciones: 1,
    ingredientesEnPiezas: [
      { ingrediente: "Pan integral", cantidad: "2 rebanadas", preparacion: "" },
      { ingrediente: "Queso cottage", cantidad: "100 g", preparacion: "" },
      { ingrediente: "Aguacate", cantidad: "1/2 unidad", preparacion: "" },
      { ingrediente: "Sal", cantidad: "al gusto", preparacion: "" },
      { ingrediente: "Aceite de oliva virgen extra", cantidad: "al gusto", preparacion: "" }
    ],
    preparacion:
      "Tuesta el pan. Unta el queso cottage sobre cada rebanada y reparte encima el aguacate en láminas. Termina con sal, pimienta y un chorrito de aceite de oliva.",
    alias: []
  },
  {
    nombre: "Ensalada de espinacas, fresas y queso cottage",
    raciones: 2,
    ingredientesEnPiezas: [
      { ingrediente: "Espinacas", cantidad: "100 g", preparacion: "frescas" },
      { ingrediente: "Queso cottage", cantidad: "150 g", preparacion: "" },
      { ingrediente: "Fresas", cantidad: "150 g", preparacion: "" },
      { ingrediente: "Aceite de oliva virgen extra", cantidad: "1 cucharada", preparacion: "" },
      { ingrediente: "Limón", cantidad: "1 cucharadita de zumo", preparacion: "" }
    ],
    preparacion:
      "Lava y escurre las espinacas, y corta las fresas en cuartos. Monta la ensalada con las espinacas de base, las fresas y el queso cottage por encima. Aliña con el aceite, el zumo de limón, sal y pimienta.",
    alias: []
  },
  {
    nombre: "Patatas asadas rellenas de queso cottage",
    raciones: 2,
    ingredientesEnPiezas: [
      { ingrediente: "Patatas", cantidad: "2 unidades", preparacion: "medianas" },
      { ingrediente: "Queso cottage", cantidad: "150 g", preparacion: "" },
      { ingrediente: "Cebollino", cantidad: "1 cucharada", preparacion: "fresco" },
      { ingrediente: "Ajo en polvo", cantidad: "1/2 cucharadita", preparacion: "" },
      { ingrediente: "Aceite de oliva virgen extra", cantidad: "1 cucharadita", preparacion: "" }
    ],
    preparacion:
      "Hornea las patatas enteras a 200 °C durante 40-50 minutos, hasta que estén tiernas por dentro. Córtalas por la mitad, vacía un poco de pulpa y mezcla con el queso cottage, el cebollino, el ajo en polvo, sal y pimienta. Rellena las patatas y hornea 10 minutos más.",
    alias: []
  },
  {
    nombre: "Pasta integral con salsa de queso cottage y espinacas",
    raciones: 2,
    ingredientesEnPiezas: [
      { ingrediente: "Pasta integral", cantidad: "150 g", preparacion: "" },
      { ingrediente: "Queso cottage", cantidad: "100 g", preparacion: "" },
      { ingrediente: "Espinacas", cantidad: "50 g", preparacion: "frescas" },
      { ingrediente: "Ajo", cantidad: "1 diente", preparacion: "" },
      { ingrediente: "Aceite de oliva virgen extra", cantidad: "1 cucharada", preparacion: "" },
      { ingrediente: "Leche", cantidad: "50 ml", preparacion: "" }
    ],
    preparacion:
      "Cuece la pasta según el paquete. Mientras, sofríe el ajo en el aceite, añade las espinacas hasta que se ablanden, y por último el queso cottage batido con la leche, sal y pimienta. Mezcla la salsa con la pasta escurrida y sirve caliente.",
    alias: []
  },
  {
    nombre: "Mug cake proteico de chocolate y avena",
    raciones: 1,
    ingredientesEnPiezas: [
      { ingrediente: "Avena", cantidad: "30 g", preparacion: "molida" },
      { ingrediente: "Cacao en polvo", cantidad: "1 cucharada", preparacion: "" },
      { ingrediente: "Leche", cantidad: "80 ml", preparacion: "" },
      { ingrediente: "Huevos", cantidad: "1 unidad", preparacion: "" },
      { ingrediente: "Levadura", cantidad: "1/2 cucharadita", preparacion: "" },
      { ingrediente: "Miel", cantidad: "1 cucharada", preparacion: "" }
    ],
    preparacion:
      "Mezcla todos los ingredientes en una taza grande apta para microondas hasta que quede una masa sin grumos. Cocina en el microondas a máxima potencia 90 segundos, comprobando que ha cuajado (si no, añade 15-20 segundos más). Deja templar un minuto antes de comer.",
    alias: []
  },
  {
    nombre: "Brownie proteico de garbanzos",
    raciones: 6,
    ingredientesEnPiezas: [
      { ingrediente: "Garbanzos cocidos", cantidad: "1 bote", preparacion: "escurridos" },
      { ingrediente: "Cacao en polvo", cantidad: "4 cucharadas", preparacion: "" },
      { ingrediente: "Huevos", cantidad: "2 unidades", preparacion: "" },
      { ingrediente: "Miel", cantidad: "3 cucharadas", preparacion: "" },
      { ingrediente: "Levadura", cantidad: "1 cucharadita", preparacion: "" },
      { ingrediente: "Esencia de vainilla", cantidad: "1 cucharadita", preparacion: "" }
    ],
    preparacion:
      "Tritura los garbanzos con el resto de ingredientes hasta obtener una masa fina y sin grumos. Vierte en un molde pequeño forrado con papel de horno y hornea a 180 °C durante 20-25 minutos. Deja enfriar del todo antes de cortar en cuadrados.",
    alias: []
  },
  {
    nombre: "Helado proteico de plátano",
    raciones: 2,
    ingredientesEnPiezas: [
      { ingrediente: "Plátano", cantidad: "2 unidades", preparacion: "maduros, congelados en rodajas" },
      { ingrediente: "Leche", cantidad: "50 ml", preparacion: "" },
      { ingrediente: "Esencia de vainilla", cantidad: "1/2 cucharadita", preparacion: "" }
    ],
    preparacion:
      "Tritura las rodajas de plátano congelado con la leche y la vainilla en una batidora potente o procesadora, parando a raspar los bordes, hasta que quede una crema tipo helado. Sirve al momento, o congela media hora más si lo quieres más firme.",
    alias: ["Nice cream de plátano"]
  },
  {
    nombre: "Pudding de chía y chocolate",
    raciones: 2,
    ingredientesEnPiezas: [
      { ingrediente: "Semillas de chía", cantidad: "4 cucharadas", preparacion: "" },
      { ingrediente: "Leche", cantidad: "250 ml", preparacion: "" },
      { ingrediente: "Cacao en polvo", cantidad: "1 cucharada", preparacion: "" },
      { ingrediente: "Miel", cantidad: "1 cucharada", preparacion: "" }
    ],
    preparacion:
      "Mezcla bien todos los ingredientes en un tarro o bol. Deja reposar en la nevera al menos 4 horas (o toda la noche), removiendo una vez a mitad de reposo para que la chía no se apelmace en el fondo.",
    alias: []
  },
  {
    nombre: "Mousse de chocolate y aguacate",
    raciones: 2,
    ingredientesEnPiezas: [
      { ingrediente: "Aguacate", cantidad: "1 unidad", preparacion: "maduro" },
      { ingrediente: "Cacao en polvo", cantidad: "2 cucharadas", preparacion: "" },
      { ingrediente: "Miel", cantidad: "2 cucharadas", preparacion: "" },
      { ingrediente: "Leche", cantidad: "2 cucharadas", preparacion: "" },
      { ingrediente: "Esencia de vainilla", cantidad: "1/2 cucharadita", preparacion: "" }
    ],
    preparacion:
      "Tritura todos los ingredientes juntos hasta obtener una crema lisa y sin grumos de aguacate. Reparte en dos vasitos y refrigera al menos 30 minutos antes de servir.",
    alias: []
  },
  {
    nombre: "Cookies proteicas de avena y arándanos",
    raciones: 8,
    ingredientesEnPiezas: [
      { ingrediente: "Avena", cantidad: "150 g", preparacion: "" },
      { ingrediente: "Plátano", cantidad: "1 unidad", preparacion: "maduro, chafado" },
      { ingrediente: "Arándanos", cantidad: "50 g", preparacion: "" },
      { ingrediente: "Miel", cantidad: "2 cucharadas", preparacion: "" },
      { ingrediente: "Esencia de vainilla", cantidad: "1 cucharadita", preparacion: "" }
    ],
    preparacion:
      "Mezcla la avena con el plátano chafado, la miel y la vainilla hasta formar una masa pegajosa, y añade los arándanos con cuidado de no romperlos. Forma montoncitos con una cuchara sobre una bandeja con papel de horno y hornea a 180 °C durante 12-15 minutos.",
    alias: []
  },
  {
    nombre: "Vasitos de yogur griego con granola y frutos rojos",
    raciones: 1,
    ingredientesEnPiezas: [
      { ingrediente: "Yogur griego", cantidad: "200 g", preparacion: "" },
      { ingrediente: "Granola", cantidad: "30 g", preparacion: "" },
      { ingrediente: "Frutos rojos", cantidad: "80 g", preparacion: "" },
      { ingrediente: "Miel", cantidad: "1 cucharadita", preparacion: "" }
    ],
    preparacion:
      "Monta el vaso en capas: una de yogur griego, otra de granola y otra de frutos rojos, repitiendo hasta llenar el vaso. Termina con un hilo de miel por encima.",
    alias: []
  },
  {
    nombre: "Flan proteico de chocolate",
    raciones: 4,
    ingredientesEnPiezas: [
      { ingrediente: "Leche", cantidad: "500 ml", preparacion: "" },
      { ingrediente: "Huevos", cantidad: "3 unidades", preparacion: "" },
      { ingrediente: "Cacao en polvo", cantidad: "3 cucharadas", preparacion: "" },
      { ingrediente: "Miel", cantidad: "3 cucharadas", preparacion: "" }
    ],
    preparacion:
      "Bate la leche con los huevos, el cacao y la miel hasta que quede bien integrado. Reparte en flaneras individuales y cuece al baño maría, tapado, a 180 °C durante 35-40 minutos, hasta que cuaje. Deja enfriar y refrigera antes de desmoldar.",
    alias: []
  },
  {
    nombre: "Polos de yogur y frutos rojos",
    raciones: 4,
    ingredientesEnPiezas: [
      { ingrediente: "Yogur natural", cantidad: "300 g", preparacion: "sin azúcar" },
      { ingrediente: "Frutos rojos", cantidad: "150 g", preparacion: "" },
      { ingrediente: "Miel", cantidad: "1 cucharada", preparacion: "" }
    ],
    preparacion:
      "Tritura la mitad de los frutos rojos con la miel y mézclalos con el yogur; reserva el resto de frutos rojos enteros. Reparte en moldes de polo alternando con los frutos rojos enteros, coloca los palitos y congela al menos 4 horas.",
    alias: []
  },
  {
    nombre: "Yogur griego con cottage y cacao (postre exprés)",
    raciones: 1,
    ingredientesEnPiezas: [
      { ingrediente: "Yogur griego", cantidad: "100 g", preparacion: "" },
      { ingrediente: "Queso cottage", cantidad: "100 g", preparacion: "" },
      { ingrediente: "Cacao en polvo", cantidad: "1 cucharadita", preparacion: "" },
      { ingrediente: "Miel", cantidad: "1 cucharadita", preparacion: "" }
    ],
    preparacion:
      "Bate el yogur griego con el queso cottage hasta que quede cremoso. Añade el cacao y la miel, y mezcla bien. Sirve frío, tal cual o con unos frutos rojos por encima.",
    alias: []
  }
];
