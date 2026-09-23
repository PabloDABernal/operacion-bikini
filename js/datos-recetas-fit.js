// Recetas "fit" (postres altos en proteína, queso cottage, tiramisús fit y
// similares, más una segunda tanda de platos salados/comidas completas),
// pedidas por el usuario el 23 de septiembre de 2026 a partir de una
// búsqueda web de recetas populares de ese estilo. Mismo formato que
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
    alias: ["Tiramisú de queso cottage", "Tiramisú proteico"],
    categorias: ["postre","fit"]
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
    alias: [],
    categorias: ["postre","fit"]
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
    alias: [],
    categorias: ["postre","fit"]
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
    alias: [],
    categorias: ["postre","fit"]
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
    alias: [],
    categorias: ["postre","fit"]
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
    alias: [],
    categorias: ["postre","fit"]
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
    alias: [],
    categorias: ["postre","fit"]
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
    alias: [],
    categorias: ["postre","fit"]
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
    alias: [],
    categorias: ["desayuno","fit"]
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
    alias: [],
    categorias: ["desayuno","fit"]
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
    alias: [],
    categorias: ["comida","fit"]
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
    alias: [],
    categorias: ["comida","fit"]
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
    alias: [],
    categorias: ["comida","fit"]
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
    alias: [],
    categorias: ["postre","fit"]
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
    alias: [],
    categorias: ["postre","fit"]
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
    alias: ["Nice cream de plátano"],
    categorias: ["postre","fit"]
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
    alias: [],
    categorias: ["postre","desayuno","fit"]
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
    alias: [],
    categorias: ["postre","fit"]
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
    alias: [],
    categorias: ["snack","fit"]
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
    alias: [],
    categorias: ["desayuno","snack","fit"]
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
    alias: [],
    categorias: ["postre","fit"]
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
    alias: [],
    categorias: ["postre","fit"]
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
    alias: [],
    categorias: ["postre","snack","fit"]
  },

  // --- Segunda tanda (23 de septiembre de 2026): platos salados / comidas
  // completas, no postres — pedido explícito del usuario tras la primera
  // tanda, que era solo de dulces.

  {
    nombre: "Bowl fitness de pollo, arroz integral y verduras",
    raciones: 2,
    ingredientesEnPiezas: [
      { ingrediente: "Pechuga de pollo", cantidad: "300 g", preparacion: "en tiras" },
      { ingrediente: "Arroz integral", cantidad: "150 g", preparacion: "" },
      { ingrediente: "Judías verdes", cantidad: "150 g", preparacion: "" },
      { ingrediente: "Ajo", cantidad: "1 diente", preparacion: "" },
      { ingrediente: "Aceite de oliva virgen extra", cantidad: "1 cucharada", preparacion: "" },
      { ingrediente: "Limón", cantidad: "1 cucharadita de zumo", preparacion: "" }
    ],
    preparacion:
      "Cuece el arroz integral según el paquete. Marina el pollo con el zumo de limón, ajo, sal y pimienta 10-15 minutos, y cocínalo en una sartén con el aceite hasta que esté dorado. Cocina las judías verdes al vapor o salteadas, y monta el bowl con el arroz de base, el pollo y las judías por encima.",
    alias: [],
    categorias: ["comida","fit"]
  },
  {
    nombre: "Poke bowl de pollo y aguacate",
    raciones: 2,
    ingredientesEnPiezas: [
      { ingrediente: "Pechuga de pollo", cantidad: "250 g", preparacion: "a la plancha, en dados" },
      { ingrediente: "Arroz", cantidad: "150 g", preparacion: "" },
      { ingrediente: "Aguacate", cantidad: "1 unidad", preparacion: "" },
      { ingrediente: "Lechuga", cantidad: "50 g", preparacion: "" },
      { ingrediente: "Zanahoria", cantidad: "1 unidad", preparacion: "rallada" },
      { ingrediente: "Salsa de soja", cantidad: "2 cucharadas", preparacion: "" },
      { ingrediente: "Semillas de sésamo", cantidad: "1 cucharadita", preparacion: "" }
    ],
    preparacion:
      "Cuece el arroz y déjalo templar. Coloca el arroz de base en un bowl y reparte por encima el pollo a la plancha, el aguacate en láminas, la lechuga y la zanahoria rallada. Riega con la salsa de soja y termina con las semillas de sésamo.",
    alias: [],
    categorias: ["comida","fit"]
  },
  {
    nombre: "Bowl mexicano de pollo y frijoles",
    raciones: 2,
    ingredientesEnPiezas: [
      { ingrediente: "Pechuga de pollo", cantidad: "250 g", preparacion: "a la plancha, en dados" },
      { ingrediente: "Arroz integral", cantidad: "150 g", preparacion: "" },
      { ingrediente: "Frijoles cocidos", cantidad: "150 g", preparacion: "" },
      { ingrediente: "Maíz dulce", cantidad: "80 g", preparacion: "" },
      { ingrediente: "Tomate", cantidad: "1 unidad", preparacion: "en dados" },
      { ingrediente: "Aguacate", cantidad: "1/2 unidad", preparacion: "" },
      { ingrediente: "Limón", cantidad: "1 cucharadita de zumo", preparacion: "" }
    ],
    preparacion:
      "Cuece el arroz integral y calienta los frijoles. Monta el bowl con el arroz de base y reparte por encima el pollo, los frijoles, el maíz, el tomate y el aguacate. Riega con el zumo de limón, sal y pimienta antes de servir.",
    alias: [],
    categorias: ["comida","fit"]
  },
  {
    nombre: "Pechuga de pollo rellena de espinacas y queso feta",
    raciones: 2,
    ingredientesEnPiezas: [
      { ingrediente: "Pechuga de pollo", cantidad: "2 unidades", preparacion: "grandes" },
      { ingrediente: "Espinacas", cantidad: "100 g", preparacion: "frescas" },
      { ingrediente: "Queso feta", cantidad: "80 g", preparacion: "desmenuzado" },
      { ingrediente: "Ajo", cantidad: "1 diente", preparacion: "" },
      { ingrediente: "Aceite de oliva virgen extra", cantidad: "1 cucharada", preparacion: "" }
    ],
    preparacion:
      "Sofríe las espinacas con el ajo hasta que se ablanden, y mézclalas con el queso feta. Haz un corte lateral a cada pechuga para formar un bolsillo y rellénalas con la mezcla, cerrando con un palillo si hace falta. Dóralas en una sartén con el aceite por ambos lados y termina de hacerlas al horno a 200 °C durante 15-20 minutos.",
    alias: [],
    categorias: ["comida","fit"]
  },
  {
    nombre: "Salmón al horno con tomates y aceitunas",
    raciones: 2,
    ingredientesEnPiezas: [
      { ingrediente: "Salmón", cantidad: "300 g", preparacion: "en lomos" },
      { ingrediente: "Tomates cherry", cantidad: "200 g", preparacion: "" },
      { ingrediente: "Pimiento rojo", cantidad: "1 unidad", preparacion: "en tiras" },
      { ingrediente: "Aceitunas", cantidad: "50 g", preparacion: "" },
      { ingrediente: "Aceite de oliva virgen extra", cantidad: "1 cucharada", preparacion: "" },
      { ingrediente: "Orégano", cantidad: "al gusto", preparacion: "" }
    ],
    preparacion:
      "Coloca el salmón en una bandeja de horno junto con los tomates cherry, el pimiento y las aceitunas. Riega todo con el aceite, sazona con sal, pimienta y orégano, y hornea a 200 °C durante 18-20 minutos, hasta que el salmón esté hecho.",
    alias: [],
    categorias: ["comida","fit"]
  },
  {
    nombre: "Cazuela de huevos con salchicha de pollo y verduras",
    raciones: 3,
    ingredientesEnPiezas: [
      { ingrediente: "Huevos", cantidad: "6 unidades", preparacion: "" },
      { ingrediente: "Salchicha de pollo", cantidad: "150 g", preparacion: "en rodajas" },
      { ingrediente: "Pimiento", cantidad: "1 unidad", preparacion: "en dados" },
      { ingrediente: "Cebolla", cantidad: "1/2 unidad", preparacion: "en dados" },
      { ingrediente: "Espinacas", cantidad: "50 g", preparacion: "" },
      { ingrediente: "Aceite de oliva virgen extra", cantidad: "1 cucharada", preparacion: "" }
    ],
    preparacion:
      "Sofríe la cebolla y el pimiento en el aceite hasta que se ablanden, añade la salchicha y dórala unos minutos, y por último las espinacas hasta que reduzcan. Bate los huevos, viértelos por encima y cocina a fuego medio-bajo, tapado, hasta que cuajen del todo.",
    alias: [],
    categorias: ["desayuno","fit"]
  },
  {
    nombre: "Muffins de huevo y pavo",
    raciones: 6,
    ingredientesEnPiezas: [
      { ingrediente: "Huevos", cantidad: "4 unidades", preparacion: "" },
      { ingrediente: "Claras de huevo", cantidad: "4 unidades", preparacion: "" },
      { ingrediente: "Pavo", cantidad: "80 g", preparacion: "en lonchas, picado" },
      { ingrediente: "Queso mozzarella", cantidad: "40 g", preparacion: "rallado" },
      { ingrediente: "Pimiento", cantidad: "1/2 unidad", preparacion: "en dados pequeños" },
      { ingrediente: "Cebolla", cantidad: "1/4 unidad", preparacion: "en dados pequeños" }
    ],
    preparacion:
      "Bate los huevos con las claras y mezcla con el pavo, el queso, el pimiento y la cebolla. Reparte la mezcla en un molde de muffins (con papelitos o engrasado) y hornea a 180 °C durante 18-20 minutos, hasta que cuajen. Se conservan bien en la nevera para varios días.",
    alias: [],
    categorias: ["desayuno","snack","fit"]
  },
  {
    nombre: "Sándwich de pavo y aguacate",
    raciones: 1,
    ingredientesEnPiezas: [
      { ingrediente: "Pan integral", cantidad: "2 rebanadas", preparacion: "" },
      { ingrediente: "Pavo", cantidad: "60 g", preparacion: "en lonchas" },
      { ingrediente: "Aguacate", cantidad: "1/2 unidad", preparacion: "" },
      { ingrediente: "Tomate", cantidad: "1/2 unidad", preparacion: "en rodajas" },
      { ingrediente: "Sal", cantidad: "al gusto", preparacion: "" }
    ],
    preparacion:
      "Chafa el aguacate y úntalo sobre una rebanada de pan. Añade las lonchas de pavo y el tomate, sazona con sal y pimienta, y cierra con la otra rebanada.",
    alias: [],
    categorias: ["comida","snack","fit"]
  },
  {
    nombre: "Sándwich cremoso de atún y aguacate",
    raciones: 1,
    ingredientesEnPiezas: [
      { ingrediente: "Pan integral", cantidad: "2 rebanadas", preparacion: "" },
      { ingrediente: "Atún", cantidad: "1 lata", preparacion: "al natural, escurrido" },
      { ingrediente: "Aguacate", cantidad: "1/2 unidad", preparacion: "" },
      { ingrediente: "Queso crema", cantidad: "2 cucharadas", preparacion: "light" },
      { ingrediente: "Sal", cantidad: "al gusto", preparacion: "" }
    ],
    preparacion:
      "Chafa el atún escurrido con el aguacate y el queso crema hasta que quede una mezcla cremosa. Sazona con sal y pimienta, y extiende entre las dos rebanadas de pan.",
    alias: [],
    categorias: ["comida","snack","fit"]
  },
  {
    nombre: "Tostada de huevo revuelto y aguacate",
    raciones: 1,
    ingredientesEnPiezas: [
      { ingrediente: "Pan integral", cantidad: "2 rebanadas", preparacion: "" },
      { ingrediente: "Huevos", cantidad: "2 unidades", preparacion: "" },
      { ingrediente: "Aguacate", cantidad: "1/2 unidad", preparacion: "" },
      { ingrediente: "Aceite de oliva virgen extra", cantidad: "1 cucharadita", preparacion: "" }
    ],
    preparacion:
      "Tuesta el pan y unta el aguacate chafado encima. Revuelve los huevos en una sartén con el aceite a fuego bajo, removiendo hasta que cuajen cremosos, y repártelos sobre las tostadas. Sazona con sal y pimienta.",
    alias: [],
    categorias: ["desayuno","fit"]
  },
  {
    nombre: "Pollo al limón con arroz",
    raciones: 2,
    ingredientesEnPiezas: [
      { ingrediente: "Pechuga de pollo", cantidad: "300 g", preparacion: "en tiras" },
      { ingrediente: "Arroz", cantidad: "150 g", preparacion: "" },
      { ingrediente: "Limón", cantidad: "1 unidad", preparacion: "zumo y ralladura" },
      { ingrediente: "Ajo", cantidad: "2 dientes", preparacion: "" },
      { ingrediente: "Aceite de oliva virgen extra", cantidad: "1 cucharada", preparacion: "" }
    ],
    preparacion:
      "Marina el pollo con el zumo y la ralladura de limón, el ajo picado, sal y pimienta durante 10-15 minutos. Cuece el arroz aparte. Cocina el pollo en una sartén con el aceite hasta que esté dorado y bien hecho, y sirve sobre el arroz.",
    alias: [],
    categorias: ["comida","fit"]
  },
  {
    nombre: "Ensalada de pollo, quinoa y aguacate",
    raciones: 2,
    ingredientesEnPiezas: [
      { ingrediente: "Pechuga de pollo", cantidad: "250 g", preparacion: "a la plancha, en tiras" },
      { ingrediente: "Quinoa", cantidad: "100 g", preparacion: "" },
      { ingrediente: "Aguacate", cantidad: "1 unidad", preparacion: "" },
      { ingrediente: "Tomate", cantidad: "1 unidad", preparacion: "en dados" },
      { ingrediente: "Aceite de oliva virgen extra", cantidad: "1 cucharada", preparacion: "" },
      { ingrediente: "Limón", cantidad: "1 cucharadita de zumo", preparacion: "" }
    ],
    preparacion:
      "Cuece la quinoa según el paquete y déjala templar. Mezcla la quinoa con el pollo, el aguacate y el tomate, y aliña con el aceite, el zumo de limón, sal y pimienta.",
    alias: [],
    categorias: ["comida","fit"]
  },
  {
    nombre: "Wrap de pavo, hummus y verduras",
    raciones: 1,
    ingredientesEnPiezas: [
      { ingrediente: "Tortilla de trigo integral", cantidad: "1 unidad", preparacion: "" },
      { ingrediente: "Pavo", cantidad: "60 g", preparacion: "en lonchas" },
      { ingrediente: "Hummus", cantidad: "2 cucharadas", preparacion: "" },
      { ingrediente: "Lechuga", cantidad: "30 g", preparacion: "" },
      { ingrediente: "Zanahoria", cantidad: "1/2 unidad", preparacion: "en tiras" }
    ],
    preparacion:
      "Extiende el hummus sobre la tortilla, reparte el pavo, la lechuga y la zanahoria por encima, y enrolla apretando bien. Corta por la mitad para servir.",
    alias: [],
    categorias: ["comida","snack","fit"]
  },
  {
    nombre: "Salteado de ternera y verduras con arroz",
    raciones: 2,
    ingredientesEnPiezas: [
      { ingrediente: "Ternera", cantidad: "250 g", preparacion: "en tiras finas" },
      { ingrediente: "Arroz", cantidad: "150 g", preparacion: "" },
      { ingrediente: "Pimiento", cantidad: "1 unidad", preparacion: "en tiras" },
      { ingrediente: "Cebolla", cantidad: "1/2 unidad", preparacion: "en tiras" },
      { ingrediente: "Salsa de soja", cantidad: "2 cucharadas", preparacion: "" },
      { ingrediente: "Aceite de oliva virgen extra", cantidad: "1 cucharada", preparacion: "" }
    ],
    preparacion:
      "Cuece el arroz aparte. Saltea la cebolla y el pimiento en el aceite a fuego fuerte, añade la ternera y saltea 2-3 minutos hasta que se dore. Añade la salsa de soja, mezcla bien y sirve sobre el arroz.",
    alias: [],
    categorias: ["comida","fit"]
  },
  {
    nombre: "Tortilla de claras con espinacas y champiñones",
    raciones: 1,
    ingredientesEnPiezas: [
      { ingrediente: "Claras de huevo", cantidad: "5 unidades", preparacion: "" },
      { ingrediente: "Espinacas", cantidad: "50 g", preparacion: "" },
      { ingrediente: "Champiñones", cantidad: "80 g", preparacion: "en láminas" },
      { ingrediente: "Aceite de oliva virgen extra", cantidad: "1 cucharadita", preparacion: "" }
    ],
    preparacion:
      "Saltea los champiñones y las espinacas en el aceite hasta que se ablanden. Bate las claras con sal y pimienta, vierte sobre las verduras y cocina a fuego medio hasta que cuaje, doblando la tortilla por la mitad al final.",
    alias: [],
    categorias: ["desayuno","fit"]
  },
  {
    nombre: "Bowl de garbanzos y pollo especiado",
    raciones: 2,
    ingredientesEnPiezas: [
      { ingrediente: "Pechuga de pollo", cantidad: "250 g", preparacion: "en dados" },
      { ingrediente: "Garbanzos cocidos", cantidad: "1 bote", preparacion: "escurridos" },
      { ingrediente: "Pimentón", cantidad: "1 cucharadita", preparacion: "" },
      { ingrediente: "Comino", cantidad: "1/2 cucharadita", preparacion: "" },
      { ingrediente: "Aceite de oliva virgen extra", cantidad: "1 cucharada", preparacion: "" },
      { ingrediente: "Limón", cantidad: "1 cucharadita de zumo", preparacion: "" }
    ],
    preparacion:
      "Sazona el pollo con el pimentón, el comino, sal y pimienta. Cocina en una sartén con el aceite hasta que esté dorado, añade los garbanzos y saltea 3-4 minutos más para que se calienten y cojan sabor. Termina con un chorrito de zumo de limón.",
    alias: [],
    categorias: ["comida","fit"]
  },
  {
    nombre: "Pasta integral con pollo y brócoli",
    raciones: 2,
    ingredientesEnPiezas: [
      { ingrediente: "Pasta integral", cantidad: "150 g", preparacion: "" },
      { ingrediente: "Pechuga de pollo", cantidad: "200 g", preparacion: "en dados" },
      { ingrediente: "Brócoli", cantidad: "150 g", preparacion: "en árboles pequeños" },
      { ingrediente: "Ajo", cantidad: "1 diente", preparacion: "" },
      { ingrediente: "Aceite de oliva virgen extra", cantidad: "1 cucharada", preparacion: "" }
    ],
    preparacion:
      "Cuece la pasta junto con el brócoli los últimos 4 minutos de cocción, y escurre ambos juntos. Mientras, dora el pollo con el ajo en una sartén con el aceite. Mezcla la pasta y el brócoli con el pollo, sazona con sal y pimienta y sirve caliente.",
    alias: [],
    categorias: ["comida","fit"]
  },
  {
    nombre: "Lomo de cerdo a la plancha con boniato asado",
    raciones: 2,
    ingredientesEnPiezas: [
      { ingrediente: "Lomo de cerdo", cantidad: "300 g", preparacion: "en filetes" },
      { ingrediente: "Boniato", cantidad: "2 unidades", preparacion: "medianos, en dados" },
      { ingrediente: "Aceite de oliva virgen extra", cantidad: "1 cucharada", preparacion: "" },
      { ingrediente: "Pimentón", cantidad: "1/2 cucharadita", preparacion: "" }
    ],
    preparacion:
      "Mezcla el boniato en dados con la mitad del aceite, el pimentón, sal y pimienta, y hornea a 200 °C durante 25-30 minutos, dando la vuelta a mitad de cocción. Sazona el lomo y hazlo a la plancha con el resto del aceite unos 3-4 minutos por lado. Sirve junto al boniato.",
    alias: [],
    categorias: ["comida","fit"]
  },
  {
    nombre: "Merluza al horno con espárragos",
    raciones: 2,
    ingredientesEnPiezas: [
      { ingrediente: "Merluza", cantidad: "300 g", preparacion: "en lomos" },
      { ingrediente: "Espárragos trigueros", cantidad: "200 g", preparacion: "" },
      { ingrediente: "Ajo", cantidad: "1 diente", preparacion: "" },
      { ingrediente: "Aceite de oliva virgen extra", cantidad: "1 cucharada", preparacion: "" },
      { ingrediente: "Limón", cantidad: "1 cucharadita de zumo", preparacion: "" }
    ],
    preparacion:
      "Coloca la merluza y los espárragos en una bandeja de horno, riega con el aceite, el ajo picado y el zumo de limón, y sazona con sal y pimienta. Hornea a 200 °C durante 15-18 minutos, hasta que la merluza esté hecha.",
    alias: [],
    categorias: ["comida","fit"]
  },
  {
    nombre: "Brochetas de pollo y pimiento a la plancha",
    raciones: 2,
    ingredientesEnPiezas: [
      { ingrediente: "Pechuga de pollo", cantidad: "300 g", preparacion: "en dados grandes" },
      { ingrediente: "Pimiento rojo", cantidad: "1 unidad", preparacion: "en trozos" },
      { ingrediente: "Cebolla", cantidad: "1 unidad", preparacion: "en trozos" },
      { ingrediente: "Aceite de oliva virgen extra", cantidad: "1 cucharada", preparacion: "" },
      { ingrediente: "Pimentón", cantidad: "1/2 cucharadita", preparacion: "" }
    ],
    preparacion:
      "Sazona el pollo con el pimentón, sal y pimienta. Ensarta en brochetas alternando pollo, pimiento y cebolla, pinta con el aceite y cocina a la plancha o parrilla 3-4 minutos por lado, hasta que el pollo esté hecho por dentro.",
    alias: [],
    categorias: ["comida","fit"]
  }
];
