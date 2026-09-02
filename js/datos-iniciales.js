// Las recetas, los ingredientes y los menús que trae la app puestos (spec 075).
//
// ARCHIVO GENERADO. No se edita a mano: sale de
// docs/menus/recetas-transcritas.json con
//
//     node docs/menus/generar-datos-iniciales.mjs
//
// Los datos son los cuatro menús de la nutricionista del usuario. Las recetas y
// los ingredientes se COPIAN a la cuenta de cada uno la primera vez que entra
// (js/siembra.js), así que a partir de ahí son suyos y puede editarlos y
// borrarlos. Los menús NO se copian: se leen de aquí.

// Subir esto hace que la siembra se vuelva a ejecutar en cuentas ya sembradas,
// metiendo solo lo que falte. Hoy nadie lo sube; existe para cuando haga falta.
export const VERSION = 1;

export const RECETAS = [
  {
    "nombre": "Tortilla de atún",
    "raciones": 1,
    "ingredientes": [
      "1 lata redonda pequeña de atún, enlatado al natural, escurrido (50 g)",
      "2 unidades medianas de huevo de gallina, entero, crudo (100 g)",
      "1/2 cucharada de café de aceite de oliva, virgen (1 g)"
    ],
    "preparacion": [
      "En un cuenco batimos el huevo y añadimos el atún junto con las especias que más nos gusten.",
      "Cocinamos la mezcla en una sartén caliente dándole la forma típica de la tortilla."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Atún",
        "cantidad": "1 lata redonda pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Huevos",
        "cantidad": "2 unidades",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1/2 cucharada de café",
        "preparacion": ""
      }
    ],
    "alias": [
      "Tortilla de 2 huevos con 1 lata de atún al natural",
      "Tortilla de 2 huevos y una lata de atún al natural"
    ]
  },
  {
    "nombre": "Huevo a la plancha",
    "raciones": 1,
    "ingredientes": [
      "1-2 huevos medianos camperos"
    ],
    "preparacion": [
      "Echar un agua de aceite y retirar el exceso con una servilleta. Cuando el aceite en la sartén se encuentre caliente añadimos el huevo, bajamos el fuego y tapamos la sartén hasta obtener la cocción deseada."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Huevos",
        "cantidad": "1-2",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Tortitas de avena y plátano",
    "raciones": 1,
    "ingredientes": [
      "1 plátano/banana",
      "30gr de avena molida",
      "1 huevo",
      "Canela al gusto (opcional)"
    ],
    "preparacion": [
      "Tritura la mitad del plátano (maduro mejor) con los copos de avena y el huevo hasta obtener una mezcla homogénea.",
      "Pon una sartén, antiadherente, a fuego medio y añade una pizca de mantequilla o una cucharadita de aceite.",
      "Cuando la sartén esté caliente, añade la masa en porciones en tamaño que quieras.",
      "Cuando empiecen a salir burbujitas de la masa, dales la vuelta y cocina hasta que estén doradas por cada lado.",
      "Puedes ir poniéndolas sobre un papel absorbente para retirar el exceso de grasa.",
      "Sirve tal cual con la otra mitad del plátano troceado y, si quieres, 1 onza de chocolate 75-85% derretida por encima.",
      "Puedes agregar un poco de levadura química a la masa si quieres que te queden más esponjosas."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Plátano",
        "cantidad": "1",
        "preparacion": ""
      },
      {
        "ingrediente": "Avena molida",
        "cantidad": "30gr",
        "preparacion": ""
      },
      {
        "ingrediente": "Huevos",
        "cantidad": "1",
        "preparacion": ""
      },
      {
        "ingrediente": "Canela",
        "cantidad": "",
        "preparacion": ""
      }
    ],
    "alias": [
      "Tortitas de 30gr de avena y plátano",
      "Tortitas de 40gr de avena y plátano"
    ]
  },
  {
    "nombre": "Boquerones asados",
    "raciones": 1,
    "ingredientes": [
      "120 gramos de boquerón, crudo",
      "1 cucharada de postre de aceite de oliva, virgen (5 g)",
      "1 cucharada de postre de sal común (3 g)",
      "2 dientes de ajo, crudo (8 g)",
      "1 cucharada sopera de perejil, fresco (3 g)"
    ],
    "preparacion": [
      "Precalienta el horno a 200ºC.",
      "Coloca los boquerones limpios (sin cabeza ni espina) en una bandeja de horno y sazona.",
      "Pica el ajo y el perejil y añádelo a un mortero junto con el AOVE (aceite de oliva virgen extra) y cubre los boquerones con este majado.",
      "Mete la bandeja con los boquerones dentro del horno.",
      "Estarán listos entre los 6 y 8 minutos."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Boquerones",
        "cantidad": "120 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de postre",
        "preparacion": ""
      },
      {
        "ingrediente": "Sal",
        "cantidad": "1 cucharada de postre",
        "preparacion": ""
      },
      {
        "ingrediente": "Ajo",
        "cantidad": "2 dientes",
        "preparacion": ""
      },
      {
        "ingrediente": "Perejil",
        "cantidad": "1 cucharada sopera",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Pasta a la boloñesa",
    "raciones": 1,
    "ingredientes": [
      "60gr de pasta en seco",
      "100 gramos de carne molida cerdo, cruda",
      "25 gramos de cebolla blanca, cruda",
      "2 cucharadas de tomate frito",
      "1 cucharada de postre de aceite de oliva, virgen (5 g)",
      "Media zanahoria",
      "Medio puerro",
      "Medio calabacín"
    ],
    "preparacion": [
      "En una sartén con un buen chorro de aceite de oliva ponemos a dorar el ajo y la cebolla.",
      "Cuando veamos que la cebolla empieza a transparentarse ligeramente añadimos la zanahoria, después el calabacín y el apio junto con un poco de sal. Salteamos las verduras durante 10-15 minutos.",
      "A continuación, añadimos la carne picada. Removemos la carne con una cuchara para que se vaya dorando homogéneamente.",
      "Cuando veamos que la carne ya está suelta y ha cambiado de color casi en su totalidad debido a la cocción, incorporaremos el tomate frito. Cubriremos todo bien con el tomate y añadiremos un poco de pimienta y orégano. Dejamos que se cocine durante unos 10 min aproximadamente.",
      "Ponemos una olla con agua y una pizca de sal a hervir, añadimos la pasta y esperamos 12 minutos para que se cueza.",
      "Finalmente mezclamos nuestra salsa boloñesa con la pasta."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Pasta",
        "cantidad": "60gr",
        "preparacion": ""
      },
      {
        "ingrediente": "Carne picada de cerdo",
        "cantidad": "100 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Cebolla",
        "cantidad": "25 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Tomate frito",
        "cantidad": "2 cucharadas",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de postre",
        "preparacion": ""
      },
      {
        "ingrediente": "Zanahoria",
        "cantidad": "Media",
        "preparacion": ""
      },
      {
        "ingrediente": "Puerro",
        "cantidad": "Medio",
        "preparacion": ""
      },
      {
        "ingrediente": "Calabacín",
        "cantidad": "Medio",
        "preparacion": ""
      }
    ],
    "alias": [
      "50gr de pasta integral / de lentejas (en seco) a la boloñesa (110gr de carne picada)",
      "60-70gr de pasta (en seco) a la boloñesa"
    ]
  },
  {
    "nombre": "Crema de puerro y calabacín",
    "raciones": 1,
    "ingredientes": [
      "1/2 unidad mediana de calabacín, crudo (160 g)",
      "1 unidad mediana de puerro, crudo (150 g)",
      "1 cucharada de café de aceite de oliva, virgen (2 g)",
      "500 gramos de agua",
      "1 ración individual de queso fresco de burgos (50 g)",
      "1/2 unidad pequeña de cebolla blanca, cruda (40 g)"
    ],
    "preparacion": [
      "Sofreír la cebolla y el puerro cortado a trocitos.",
      "Añadir el calabacín cortado a trozos junto a un par de vasos de agua.",
      "Dejar que hierva un poco y volver a añadir agua hasta cubrir todas las verduras.",
      "Dejar que hierva a fuego lento hasta que ya se vea todo bien pochado.",
      "Añadir sal, tomillo y nuez moscada.",
      "Añadir la tarrina de queso de burgos y dejar reposar unos minutos.",
      "Pasar la turmix y listo para servir."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Calabacín",
        "cantidad": "1/2 unidad mediana",
        "preparacion": ""
      },
      {
        "ingrediente": "Puerro",
        "cantidad": "1 unidad mediana",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de café",
        "preparacion": ""
      },
      {
        "ingrediente": "Agua",
        "cantidad": "500 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Queso de burgos",
        "cantidad": "1 ración individual",
        "preparacion": ""
      },
      {
        "ingrediente": "Cebolla",
        "cantidad": "1/2 unidad pequeña",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Pudding de chía y canela",
    "raciones": 1,
    "ingredientes": [
      "1 cucharada sopera de semillas de chía",
      "Edulcorante al gusto (opcional)",
      "125 gramos de queso fresco batido",
      "50 gramos de leche, entera, UHT",
      "Canela en polvo"
    ],
    "preparacion": [
      "Dejar en remojo la chía con la leche (o el agua o la bebida vegetal) y la canela durante al menos 15 minutos o varias horas. De forma preferente dejarlas durante toda la noche.",
      "Una vez se hayan “hinchado”, mezclar la chía con el yogur o el kéfir.",
      "Puedes poner alguna fruta como topping."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Semillas de chía",
        "cantidad": "1 cucharada sopera",
        "preparacion": ""
      },
      {
        "ingrediente": "Edulcorante",
        "cantidad": "",
        "preparacion": ""
      },
      {
        "ingrediente": "Queso batido",
        "cantidad": "125 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Leche",
        "cantidad": "50 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Canela",
        "cantidad": "",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Lubina al horno con tomates y trigueros",
    "raciones": 1,
    "ingredientes": [
      "100gr de espárragos verdes",
      "1 tomate",
      "1 diente de ajo, crudo (4 g)",
      "Perejil al gusto",
      "50 gramos de pan rallado",
      "1 porción individual de lubina, cruda (180 g)"
    ],
    "preparacion": [
      "Poner el pan rallado, la albahaca, los piñones y aceite de oliva en un recipiente. Triturar todo y reservar.",
      "Cubrir la lubina con la mezcla reservada. Poner en una bandeja de horno junto con el tomate cortado a mitades, y las puntas de los espárragos.",
      "Introducir la bandeja en el horno y dejar que se cocine a 200 ºC durante unos 8-14 minutos (comprobar que está cocinado, ya que esto va a depender de la pieza y del horno). Sacar del horno y servir."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Espárragos verdes",
        "cantidad": "100gr",
        "preparacion": ""
      },
      {
        "ingrediente": "Tomate",
        "cantidad": "1",
        "preparacion": ""
      },
      {
        "ingrediente": "Ajo",
        "cantidad": "1 diente",
        "preparacion": ""
      },
      {
        "ingrediente": "Perejil",
        "cantidad": "",
        "preparacion": ""
      },
      {
        "ingrediente": "Pan rallado",
        "cantidad": "50 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Lubina",
        "cantidad": "1 porción individual",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Pudding de chía y mermelada",
    "raciones": 1,
    "ingredientes": [
      "1 cucharada de semillas de chía",
      "50 gramos de leche, desnatada, UHT",
      "125 gramos de queso fresco batido",
      "1 cucharadita de mermelada sin azúcar (20 g)"
    ],
    "preparacion": [
      "Mezcla la leche y la chía en un recipiente pequeño y revuelve muy bien para evitar que las semillas de chía queden pegadas.",
      "Lleva tu mezcla al refrigerador y deja reposar de 30 minutos a 6-8 horas.",
      "Una vez transcurrido el tiempo, retira del refrigerador y decora con mermelada sin azúcar añadida y algunos berries. Y listo, mezcla bien y disfruta."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Semillas de chía",
        "cantidad": "1 cucharada",
        "preparacion": ""
      },
      {
        "ingrediente": "Leche",
        "cantidad": "50 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Queso batido",
        "cantidad": "125 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Mermelada sin azúcar",
        "cantidad": "1 cucharadita",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Bacalao al papillote con verduras",
    "raciones": 1,
    "ingredientes": [
      "1 porción individual de bacalao, fresco, crudo (175 g)",
      "1 cucharada de postre de aceite de oliva, virgen (5 g)",
      "1/4 unidad pequeña de pimiento verde, crudo (20 g)",
      "1/4 unidad pequeña de cebolla blanca, cruda (20 g)",
      "100 gramos de calabaza, cruda",
      "100 gramos de calabacín, crudo"
    ],
    "preparacion": [
      "Hacer una cama con las verduras en un trozo de papel de aluminio (mejor si antes las hemos salteado ligeramente) y poner el bacalao encima con una pizca de aceite de oliva.",
      "Cerrar el papel de aluminio para que no se salga el jugo.",
      "Cocinar en el horno durante 15 minutos."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Bacalao",
        "cantidad": "1 porción individual",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de postre",
        "preparacion": ""
      },
      {
        "ingrediente": "Pimiento verde",
        "cantidad": "1/4 unidad pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Cebolla",
        "cantidad": "1/4 unidad pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Calabaza",
        "cantidad": "100 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Calabacín",
        "cantidad": "100 gramos",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Champiñones portobello en salsa de soja",
    "raciones": 1,
    "ingredientes": [
      "120gr de champiñones portobello",
      "1 diente de ajo, crudo (4 g)",
      "1 cucharada de café de aceite de oliva, virgen (2 g)",
      "1 cucharada sopera de salsa de soja (13 g)",
      "2 cucharadas soperas de agua"
    ],
    "preparacion": [
      "Corta tus champiñones en cuatro. Pela y pica tu ajo. En una sartén caliente con aceite echa el ajo y saltea un minuto, seguidamente añade los champiñones y deja cocer hasta que cambien de color. Añade ahora el agua y la salsa de soja y deja que el líquido se espese y reduzca a la mitad."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Champiñones portobello",
        "cantidad": "120gr",
        "preparacion": ""
      },
      {
        "ingrediente": "Ajo",
        "cantidad": "1 diente",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de café",
        "preparacion": ""
      },
      {
        "ingrediente": "Salsa de soja",
        "cantidad": "1 cucharada sopera",
        "preparacion": ""
      },
      {
        "ingrediente": "Agua",
        "cantidad": "2 cucharadas soperas",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Arroz con verduras",
    "raciones": 1,
    "ingredientes": [
      "1 cucharada de café de pimentón, en polvo (3 g)",
      "20 gramos de vino blanco, 11º",
      "1 guarnición de menestra de verduras, en conserva (125 g)",
      "20 gramos de cebolla blanca, cruda",
      "20 gramos de pimiento verde, crudo",
      "20 gramos de pimiento rojo, crudo",
      "60 gramos de arroz blanco, crudo"
    ],
    "preparacion": [
      "Rehogar en el aceite los pimientos, ajos y cebolla junto con una hoja de laurel.",
      "Poner una cucharada de pimentón y rápidamente la verdura. Dar unas vueltas y añadir el vino.",
      "Cuando se evapore el alcohol, poner un poco de agua para guisar la verdura.",
      "Dejar unos minutos antes de poner el arroz. Cocer hasta que esté tierno.",
      "Dejar reposar antes de servir."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Pimentón",
        "cantidad": "1 cucharada de café",
        "preparacion": ""
      },
      {
        "ingrediente": "Vino blanco",
        "cantidad": "20 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Menestra",
        "cantidad": "1 guarnición",
        "preparacion": ""
      },
      {
        "ingrediente": "Cebolla",
        "cantidad": "20 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Pimiento verde",
        "cantidad": "20 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Pimiento rojo",
        "cantidad": "20 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Arroz blanco",
        "cantidad": "60 gramos",
        "preparacion": ""
      }
    ],
    "alias": [
      "125gr de arroz (hervido) con verduras"
    ]
  },
  {
    "nombre": "Yogur con fruta y cereal",
    "raciones": 1,
    "ingredientes": [
      "125 gramos de yogur natural de proteínas",
      "30 gramos de cereales sin azúcar",
      "Fruta al gusto",
      "Edulcorante (opcional)"
    ],
    "preparacion": [
      "Pon en tu bol el yogur de proteínas, queso batido o yogur griego. Puedes añadir edulcorante a tu gusto si lo deseas. Coloca los cereales a un lado y las frutas al otro o a tu gusto."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Yogur de proteínas",
        "cantidad": "125 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Cereales sin azúcar",
        "cantidad": "30 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Fruta",
        "cantidad": "",
        "preparacion": ""
      },
      {
        "ingrediente": "Edulcorante",
        "cantidad": "",
        "preparacion": ""
      }
    ],
    "alias": [
      "125gr de yogur con fruta y 30gr de cereal",
      "125gr de yogur natural con pieza de fruta y 30gr de cereal sin azúcar",
      "125gr de yogur vegetal con fruta y 30gr de cereal sin azúcar (arroz, quinoa, maíz, sin gluten...)"
    ]
  },
  {
    "nombre": "Berenjena rellena de atún",
    "raciones": 1,
    "ingredientes": [
      "1 unidad mediana de berenjena, cruda (360 g)",
      "1 lata redonda pequeña de atún, enlatado al natural, escurrido (50 g)",
      "1/2 cebolla o cebolla congelada",
      "1/4 unidad pequeña de pimiento rojo o congelado",
      "1/4 unidad pequeña de pimiento verde, crudo (20 g)",
      "1 diente de ajo, crudo (4 g)",
      "1 cucharada de café de aceite de oliva, virgen (2 g)"
    ],
    "preparacion": [
      "Cortar las berenjenas al medio en sentido longitudinal y colocarlas en un recipiente apto para microondas y poner a máxima potencia durante 7 minutos tapadas.",
      "Retirar y con la ayuda de una cuchara, sacarles la pulpa. Conservar las cáscaras para luego rellenarlas.",
      "Picar la cebolla y el morrón y cocinarlos en una sartén con AOVE (puedes comprarlo congelado) agregando un chorrito de agua hasta que estén blandos.",
      "Agregar el atún escurrido, la pulpa de berenjena y condimentar a gusto (sal, pimienta, perejil y endulzante si les gusta agridulce).",
      "Agregar una cucharada sopera de queso untable 0% grasa opcionalmente.",
      "Rellenar las cáscaras con la mezcla obtenida y llevar al micro durante 3 minutos aprox."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Berenjena",
        "cantidad": "1 unidad mediana",
        "preparacion": ""
      },
      {
        "ingrediente": "Atún",
        "cantidad": "1 lata redonda pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Cebolla",
        "cantidad": "1/2",
        "preparacion": ""
      },
      {
        "ingrediente": "Pimiento rojo",
        "cantidad": "1/4 unidad pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Pimiento verde",
        "cantidad": "1/4 unidad pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Ajo",
        "cantidad": "1 diente",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de café",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Brochetas de pavo y calabacín",
    "raciones": 1,
    "ingredientes": [
      "120 gramos de pavo, pechuga, sin piel, cruda",
      "1 unidad mediana de calabacín, crudo (320 g)",
      "1 unidad “canario” de tomate maduro, crudo (75 g)",
      "1 cucharada de postre de aceite de oliva, virgen (5 g)"
    ],
    "preparacion": [
      "Haz las brochetas con los alimentos en dados y cocina a la vez."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Pechuga de pavo",
        "cantidad": "120 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Calabacín",
        "cantidad": "1 unidad mediana",
        "preparacion": ""
      },
      {
        "ingrediente": "Tomate",
        "cantidad": "",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de postre",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Muslo de pollo asado",
    "raciones": 1,
    "ingredientes": [
      "100 gramos de agua",
      "1 cucharada de café de aceite de oliva, virgen (2 g)",
      "1 muslo de pollo",
      "1 diente de ajo, crudo (4 g)",
      "1 cucharada sopera de perejil, fresco (3 g)",
      "1 cucharada de postre de sal común (3 g)",
      "1 gramo de sal y pimienta"
    ],
    "preparacion": [
      "Salpimentamos el muslo de pollo.",
      "En un mortero ponemos el aceite, el ajo y el perejil y lo majamos todo muy bien. Lo extendemos por todo el pollo.",
      "En una fuente para horno ponemos el pollo y lo regamos con el vino blanco (opcional).",
      "Precalienta el horno a 200º, una vez que tenga la temperatura adecuada, introduce la bandeja en el horno y mantén una temperatura de 180º C. Pasados unos 15 minutos dar la vuelta y dejarlo 15 minutos más o hasta cuando esté hecho."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Agua",
        "cantidad": "100 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de café",
        "preparacion": ""
      },
      {
        "ingrediente": "Muslo de pollo",
        "cantidad": "1",
        "preparacion": ""
      },
      {
        "ingrediente": "Ajo",
        "cantidad": "1 diente",
        "preparacion": ""
      },
      {
        "ingrediente": "Perejil",
        "cantidad": "1 cucharada sopera",
        "preparacion": ""
      },
      {
        "ingrediente": "Sal",
        "cantidad": "1 cucharada de postre",
        "preparacion": ""
      },
      {
        "ingrediente": "Sal",
        "cantidad": "1 gramo",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Pudding de chía, avena y fruta",
    "raciones": 1,
    "ingredientes": [
      "30 gramos de avena en copos, para el desayuno",
      "125gr de yogur natural o vegetal",
      "100 gramos de bebida vegetal o leche semidesnatada",
      "1 cucharadita de miel o edulcorante al gusto",
      "1 cucharada de chía",
      "Fruta a tu elección (kiwi, arándanos, fresa, melocotón, manzana, piña, pera...)"
    ],
    "preparacion": [
      "Mezcla todos los ingredientes menos la fruta y deja reposar en la nevera mínimo 30 minutos (ideal toda la noche). Incorpora la fruta y disfruta."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Avena en copos",
        "cantidad": "30 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Yogur natural",
        "cantidad": "125gr",
        "preparacion": ""
      },
      {
        "ingrediente": "Leche",
        "cantidad": "100 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Edulcorante",
        "cantidad": "1 cucharadita",
        "preparacion": ""
      },
      {
        "ingrediente": "Semillas de chía",
        "cantidad": "1 cucharada",
        "preparacion": ""
      },
      {
        "ingrediente": "Fruta",
        "cantidad": "",
        "preparacion": ""
      }
    ],
    "alias": [
      "Pudding de chía, 30gr de avena y fruta"
    ]
  },
  {
    "nombre": "Ensalada de espinacas, tomate, aguacate y atún",
    "raciones": 1,
    "ingredientes": [
      "1/2 unidad grande de tomate maduro, crudo (130 g)",
      "1/4 unidad mediana de aguacate, crudo (48 g)",
      "1 cucharadita de vinagre de Módena (3 g)",
      "1 pizca de sal",
      "1 guarnición de espinaca, cruda (50 g)",
      "1 lata redonda pequeña de atún, enlatado al natural, escurrido (50 g)",
      "1/4 unidad de pepino"
    ],
    "preparacion": [
      "Cogemos una bolsa de espinacas y lo echamos en un bol. A continuación, cortamos a cuadraditos el aguacate y el tomate. Lo añadimos en el bol. Agregamos las latas de atún al natural escurrido. Aliñamos con aceite de oliva, vinagre y sal. Por último, lo removemos todo y ya tendremos nuestra receta cocina de ensalada de espinacas fácil y rápida."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Tomate",
        "cantidad": "1/2 unidad grande",
        "preparacion": ""
      },
      {
        "ingrediente": "Aguacate",
        "cantidad": "1/4 unidad mediana",
        "preparacion": ""
      },
      {
        "ingrediente": "Vinagre de Módena",
        "cantidad": "1 cucharadita",
        "preparacion": ""
      },
      {
        "ingrediente": "Sal",
        "cantidad": "1 pizca",
        "preparacion": ""
      },
      {
        "ingrediente": "Espinacas",
        "cantidad": "1 guarnición",
        "preparacion": ""
      },
      {
        "ingrediente": "Atún",
        "cantidad": "1 lata redonda pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Pepino",
        "cantidad": "1/4 unidad",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Café con bebida de avena",
    "raciones": 1,
    "ingredientes": [
      "1 taza de café, solo (45 g)",
      "180 gramos de bebida de avena"
    ],
    "preparacion": [
      "Mezclar."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Café",
        "cantidad": "1 taza",
        "preparacion": ""
      },
      {
        "ingrediente": "Bebida de avena",
        "cantidad": "180 gramos",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Guisantes con ajo y cebolla",
    "raciones": 1,
    "ingredientes": [
      "150-200 gramos de guisante, congelado, crudo",
      "1 diente de ajo, crudo (4 g)",
      "1/2 unidad pequeña de cebolla blanca, cruda (40 g)",
      "1 cucharada de café de aceite de oliva, virgen (2 g)"
    ],
    "preparacion": [
      "Sofríe la cebolla y el ajo, añade los guisantes y deja tres minutos más."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Guisantes",
        "cantidad": "150-200 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Ajo",
        "cantidad": "1 diente",
        "preparacion": ""
      },
      {
        "ingrediente": "Cebolla",
        "cantidad": "1/2 unidad pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de café",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Alcachofas a la plancha con mostaza",
    "raciones": 1,
    "ingredientes": [
      "1 cucharada de postre de aceite de oliva, virgen (5 g)",
      "1 gramo de pimienta, negra",
      "3-4 alcachofas (según tamaño) o 1 lata escurrida de alcachofas en conserva",
      "1 cucharadita de mostaza dijón (5 g)"
    ],
    "preparacion": [
      "Cortar las alcachofas dejando solo casi el corazón y laminarlas.",
      "Ponerlas en la plancha caliente con un hilo de aceite y dorar, con pimienta y sal.",
      "Cuando estén doradas servir en un plato con mostaza de dijón, una cucharadita de acompañamiento.",
      "Se puede utilizar alcachofas en conserva."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de postre",
        "preparacion": ""
      },
      {
        "ingrediente": "Pimienta negra",
        "cantidad": "1 gramo",
        "preparacion": ""
      },
      {
        "ingrediente": "Alcachofas",
        "cantidad": "",
        "preparacion": ""
      },
      {
        "ingrediente": "Mostaza dijón",
        "cantidad": "1 cucharadita",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Tortilla de pimiento rojo, berenjena y jamón serrano",
    "raciones": 1,
    "ingredientes": [
      "2 huevos",
      "2 unidades medianas de huevo de gallina, clara, cruda (66 g)",
      "Medio pimiento rojo pequeño",
      "1 loncha de jamón serrano",
      "2 rodajas de berenjena",
      "1 cucharadita de aceite de oliva",
      "Sal y pimienta"
    ],
    "preparacion": [
      "Corta tus verduras en pedacitos pequeños y saltea en una sartén con un chorrito de aceite hasta que quede bien pochado. Bate tus huevos hasta espumar junto con las claras. Añade a tus huevos, las verduras junto al jamón serrano cortado a pedazos. Mezclar bien hasta impregnar bien todos los ingredientes. Añade sal y pimienta si lo deseas y lleva de nuevo a la sartén. Deja que cueza un lado y dale la vuelta, deja cocer al gusto y listo."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Huevos",
        "cantidad": "2",
        "preparacion": ""
      },
      {
        "ingrediente": "Huevos",
        "cantidad": "2 unidades",
        "preparacion": ""
      },
      {
        "ingrediente": "Pimiento rojo",
        "cantidad": "Medio",
        "preparacion": ""
      },
      {
        "ingrediente": "Jamón serrano",
        "cantidad": "1 loncha",
        "preparacion": ""
      },
      {
        "ingrediente": "Berenjena",
        "cantidad": "2 rodajas",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharadita",
        "preparacion": ""
      },
      {
        "ingrediente": "Sal",
        "cantidad": "",
        "preparacion": ""
      }
    ],
    "alias": [
      "Tortilla de 2 huevos con pimiento rojo, berenjena y jamón serrano"
    ]
  },
  {
    "nombre": "Salteado de pollo, brócoli y champiñones",
    "raciones": 1,
    "ingredientes": [
      "100 gramos de champiñón, crudo",
      "120 gramos de pavo, pechuga, sin piel, cruda",
      "100 gramos de brócoli",
      "1/4 unidad pequeña de cebolla blanca, cruda (20 g)",
      "1 cucharada sopera de salsa de soja (13 g) OPCIONAL"
    ],
    "preparacion": [
      "Corta los champiñones y la cebolla en láminas.",
      "Pela la batata y córtala en trozos no muy grandes.",
      "Lava y corta el brócoli en ramilletes.",
      "En una sartén, con un poco de aceite, saltea a fuego medio todas las verduras: la cebolla, los champiñones y los ramilletes de brócoli, durante 7-8 minutos. Comprueba que las verduras están crujientes pero no crudas.",
      "Corta la pechuga de pollo en tiras o dados y, en otra sartén con un poco de aceite y una pizca de sal, cocínalo hasta que esté dorado.",
      "Añade el pollo a la sartén que contiene las verduras. Añade la salsa de soja y sube el fuego. Saltea 2-3 minutos más, apaga el fuego y sirve el contenido de la sartén en tu plato."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Champiñones",
        "cantidad": "100 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Pechuga de pavo",
        "cantidad": "120 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Brócoli",
        "cantidad": "100 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Cebolla",
        "cantidad": "1/4 unidad pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Salsa de soja",
        "cantidad": "1 cucharada sopera",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Berenjena a la plancha",
    "raciones": 1,
    "ingredientes": [
      "1 guarnición de berenjena, cruda (180 g)",
      "1 cucharada de café de aceite de oliva, virgen (2 g)",
      "1 gramo de pimienta, seca, molida"
    ],
    "preparacion": [
      "Lava y corta tu berenjena a rodajas y saltea en una sartén caliente con AOVE hasta cocer. Salpimentar al gusto y servir."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Berenjena",
        "cantidad": "1 guarnición",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de café",
        "preparacion": ""
      },
      {
        "ingrediente": "Pimienta negra",
        "cantidad": "1 gramo",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Hamburguesa de ternera",
    "raciones": 1,
    "ingredientes": [
      "120gr de ternera"
    ],
    "preparacion": [
      "Hamburguesa a la plancha."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Ternera",
        "cantidad": "120gr",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Crema de zanahoria",
    "raciones": 1,
    "ingredientes": [
      "1 cucharada de postre de aceite de oliva, virgen (5 g)",
      "80 gramos de caldo vegetal",
      "30 gramos de apio, crudo",
      "40 gramos de cebolla blanca, cruda",
      "150 gramos de zanahoria, cruda"
    ],
    "preparacion": [
      "Limpiar la verdura y cortar en trozos regulares.",
      "Saltear todo junto con el aceite en una cazuela unos minutos.",
      "Salpimentar y añadir un poco de agua.",
      "Dejar que cueza todo junto hasta que las verduras estén blanditas.",
      "Triturar en la batidora hasta que quede una crema fina y servir."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de postre",
        "preparacion": ""
      },
      {
        "ingrediente": "Caldo vegetal",
        "cantidad": "80 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Apio",
        "cantidad": "30 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Cebolla",
        "cantidad": "40 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Zanahoria",
        "cantidad": "150 gramos",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Lubina a la plancha",
    "raciones": 1,
    "ingredientes": [
      "1 porción individual de lubina, cruda (180 g)"
    ],
    "preparacion": [
      "Cocinar la lubina con poco AOVE o sin él en una sartén antiadherente. Primero por la parte de la piel durante unos 5 minutos aprox, darle la vuelta y dejarlo 3 minutos más o al gusto."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Lubina",
        "cantidad": "1 porción individual",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Ensalada de repollo y manzana",
    "raciones": 1,
    "ingredientes": [
      "Media cucharada de mostaza en grano",
      "Pimienta molida",
      "Un puñado de repollo morado a tiras",
      "Un puñado de repollo a tiras",
      "1/2 manzana",
      "1 cucharada sopera de queso batido"
    ],
    "preparacion": [
      "En un envase pequeño, prepara el aderezo mezclando el queso batido, la mostaza y la pimienta. Pon la mezcla a un lado en lo que preparas la ensalada.",
      "En un envase grande y cómodo, mezcla los repollos y la zanahoria. Luego aderézalos, añadiendo la mezcla del paso anterior.",
      "Corta las manzanas en tiritas, estilo julienne.",
      "Mezcla las manzanas en tiritas con el resto de los ingredientes y sirve para acompañar."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Mostaza",
        "cantidad": "Media cucharada",
        "preparacion": ""
      },
      {
        "ingrediente": "Pimienta negra",
        "cantidad": "",
        "preparacion": ""
      },
      {
        "ingrediente": "Repollo morado",
        "cantidad": "Un puñado",
        "preparacion": ""
      },
      {
        "ingrediente": "Col repollo",
        "cantidad": "Un puñado",
        "preparacion": ""
      },
      {
        "ingrediente": "Manzana",
        "cantidad": "1/2",
        "preparacion": ""
      },
      {
        "ingrediente": "Queso batido",
        "cantidad": "1 cucharada sopera",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Boniato asado",
    "raciones": 1,
    "ingredientes": [
      "1 unidad pequeña de boniato, crudo (90 g)"
    ],
    "preparacion": [
      "Cortar el boniato por la mitad y coloca boca abajo en el horno sobre papel de horno.",
      "Cocinar en el horno a 180º durante 20 minutos, según horno."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Boniato",
        "cantidad": "1 unidad pequeña",
        "preparacion": ""
      }
    ],
    "alias": [
      "Boniato pequeño asado"
    ]
  },
  {
    "nombre": "Salmón a la plancha con judías verdes",
    "raciones": 1,
    "ingredientes": [
      "200 gramos de judías verdes guisadas",
      "1 filete de salmón fresco"
    ],
    "preparacion": [],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Judías verdes",
        "cantidad": "200 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Salmón",
        "cantidad": "1 filete",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Ensalada mixta completa",
    "raciones": 1,
    "ingredientes": [
      "1 cucharada de postre de vinagre (5 g)",
      "1 unidad de espárrago blanco, en conserva (20 g)",
      "1 unidad pequeña de cebolla blanca, cruda (80 g)",
      "1 unidad mediana de zanahoria, cruda (90 g)",
      "1 unidad “canario” de tomate maduro, crudo (75 g)",
      "1 ración individual de lechuga, cruda (70 g)",
      "20 gramos de pepino, crudo",
      "1 cucharada de café de aceite de oliva, virgen (2 g)",
      "1 lata redonda pequeña de atún, enlatado al natural, escurrido (50 g)",
      "1 ración individual de queso fresco, vaca, 0% MG/ES, natural (50 g)",
      "1 unidad pequeña de huevo de gallina, hervido duro (40 g)"
    ],
    "preparacion": [
      "Cocer el huevo y reservar.",
      "En un bol añadir todos los ingredientes troceados y el atún desmigado.",
      "Aliñar y servir."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Vinagre",
        "cantidad": "1 cucharada de postre",
        "preparacion": ""
      },
      {
        "ingrediente": "Espárragos blancos",
        "cantidad": "1 unidad",
        "preparacion": ""
      },
      {
        "ingrediente": "Cebolla",
        "cantidad": "1 unidad pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Zanahoria",
        "cantidad": "1 unidad mediana",
        "preparacion": ""
      },
      {
        "ingrediente": "Tomate",
        "cantidad": "",
        "preparacion": ""
      },
      {
        "ingrediente": "Lechuga",
        "cantidad": "1 ración individual",
        "preparacion": ""
      },
      {
        "ingrediente": "Pepino",
        "cantidad": "20 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de café",
        "preparacion": ""
      },
      {
        "ingrediente": "Atún",
        "cantidad": "1 lata redonda pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Queso fresco",
        "cantidad": "1 ración individual",
        "preparacion": ""
      },
      {
        "ingrediente": "Huevos",
        "cantidad": "1 unidad pequeña",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Merluza con menestra",
    "raciones": 1,
    "ingredientes": [
      "1 porción individual de merluza, cruda (180 g)",
      "1 unidad pequeña de zanahoria, cruda (45 g)",
      "100 gramos de judías verdes",
      "100 gramos de guisantes",
      "1 cucharada de postre de aceite de oliva, virgen (5 g)"
    ],
    "preparacion": [
      "Colocar los lomos de merluza sobre una cama de verduras listas para cocer al vapor.",
      "Una vez cocinado aliñar con sal y aceite."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Merluza",
        "cantidad": "1 porción individual",
        "preparacion": ""
      },
      {
        "ingrediente": "Zanahoria",
        "cantidad": "1 unidad pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Judías verdes",
        "cantidad": "100 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Guisantes",
        "cantidad": "100 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de postre",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Calabaza con requesón, burrata o mozzarella",
    "raciones": 1,
    "ingredientes": [
      "180 gramos de calabaza, hervida",
      "50 gramos de requesón (mató) o 50 gramos de queso mozzarella",
      "1 cucharada de café de aceite de oliva, virgen (2 g)"
    ],
    "preparacion": [
      "Hervir la calabaza o hacerla al horno.",
      "Cortarla en cuadraditos y añadir el requesón desmenuzado por encima. Aliñar con aceite y albahaca."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Calabaza",
        "cantidad": "180 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Mozzarella",
        "cantidad": "",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de café",
        "preparacion": ""
      }
    ],
    "alias": [
      "Calabaza con requesón / burrata / mozzarella"
    ]
  },
  {
    "nombre": "Sartenada de champiñón con huevo",
    "raciones": 1,
    "ingredientes": [
      "1 huevo",
      "150 gramos de champiñón, crudo",
      "60 gramos de jamón serrano",
      "1 diente de ajo, crudo (4 g)",
      "1 cucharada de café de aceite de oliva",
      "Orégano",
      "Romero",
      "Tomillo",
      "Pimienta molida"
    ],
    "preparacion": [
      "Pela y corta tu ajo a láminas y picado, a tu gusto. Lava y corta tus champiñones a láminas o en cuatro partes. En una sartén caliente añade el AOVE, incorpora el ajo y cuando esté dorado añade los champiñones. Salpimienta, añade el orégano y mezcla. Saltea hasta que esté blandito y añade el jamón serrano. Mezcla hasta que cambie de color. Ahora baja el fuego al mínimo, haz un huequito en el centro de tu sartén y añade tu huevo. Pon la tapa a la sartén y déjalo hasta que tenga la cocción que tí más te guste. A más tiempo tapada tu sartén más cocida estará la yema de tu huevo. Para servir añade un poquito de orégano por encima."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Huevos",
        "cantidad": "1",
        "preparacion": ""
      },
      {
        "ingrediente": "Champiñones",
        "cantidad": "150 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Jamón serrano",
        "cantidad": "60 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Ajo",
        "cantidad": "1 diente",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de café",
        "preparacion": ""
      },
      {
        "ingrediente": "Orégano",
        "cantidad": "",
        "preparacion": ""
      },
      {
        "ingrediente": "Romero",
        "cantidad": "",
        "preparacion": ""
      },
      {
        "ingrediente": "Tomillo",
        "cantidad": "",
        "preparacion": ""
      },
      {
        "ingrediente": "Pimienta negra",
        "cantidad": "",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Ensalada de alubias con atún",
    "raciones": 1,
    "ingredientes": [
      "180 gramos de alubia blanca, en conserva",
      "1 lata redonda pequeña de atún, enlatado al natural, escurrido (50 g)",
      "70 gramos de cebolla blanca, cruda",
      "1 cucharada sopera de aceite de oliva, virgen (9 g)",
      "1/2 unidad “canario” de tomate maduro, crudo (38 g)",
      "1/4 unidad mediana de pepino, crudo (50 g)",
      "4 unidades sin hueso de aceituna negra, en salmuera (12 g)"
    ],
    "preparacion": [
      "Abrimos un bote de alubias cocidas. Lavamos y reservamos. Escurrimos una lata de atún en conserva. Partimos las verduras en trozos pequeños. Mezclamos las verduras con el atún con las alubias y aliñamos con sal y aceite de oliva virgen."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Alubias",
        "cantidad": "180 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Atún",
        "cantidad": "1 lata redonda pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Cebolla",
        "cantidad": "70 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada sopera",
        "preparacion": ""
      },
      {
        "ingrediente": "Tomate",
        "cantidad": "",
        "preparacion": ""
      },
      {
        "ingrediente": "Pepino",
        "cantidad": "1/4 unidad mediana",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceitunas",
        "cantidad": "4 unidades",
        "preparacion": ""
      }
    ],
    "alias": [
      "ensalada de 120-150gr de alubias (en conserva) con atún"
    ]
  },
  {
    "nombre": "Ensalada de pasta de lentejas y queso de cabra",
    "raciones": 1,
    "ingredientes": [
      "1/2 unidad mediana de tomate maduro, crudo (70 g)",
      "1 guarnición de lechuga, cruda (35 g)",
      "1/2 cebolla morada",
      "30 gramos de queso de cabra, pasta blanda",
      "60 gramos de pasta de lentejas",
      "1/4 unidad pequeña de pimiento rojo, crudo (38 g)",
      "1 cucharada de postre de aceite de oliva, virgen (5 g)"
    ],
    "preparacion": [
      "Cocer la pasta.",
      "Picar el resto de ingredientes y mezclar."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Tomate",
        "cantidad": "1/2 unidad mediana",
        "preparacion": ""
      },
      {
        "ingrediente": "Lechuga",
        "cantidad": "1 guarnición",
        "preparacion": ""
      },
      {
        "ingrediente": "Cebolla morada",
        "cantidad": "1/2",
        "preparacion": ""
      },
      {
        "ingrediente": "Queso de cabra",
        "cantidad": "30 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Pasta de lentejas",
        "cantidad": "60 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Pimiento rojo",
        "cantidad": "1/4 unidad pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de postre",
        "preparacion": ""
      }
    ],
    "alias": [
      "Ensalada de 50-60gr pasta de lentejas (seco) y queso de cabra + lata de atún"
    ]
  },
  {
    "nombre": "Espinacas rehogadas con pimentón",
    "raciones": 1,
    "ingredientes": [
      "1 ración individual de espinaca, cruda (90 g)",
      "1/4 unidad pequeña de cebolla blanca, cruda (20 g)",
      "1/2 cucharada de café de pimentón, en polvo (2 g)",
      "1 cucharada de café de aceite de oliva, virgen (2 g)"
    ],
    "preparacion": [
      "Pica la cebolla y saltea en una sartén con aceite hasta pochar. Ahora saltea las espinacas hasta reducir su tamaño. Añadir el pimentón y remover para que no se queme. Salpimentar al gusto, mezclar y servir."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Espinacas",
        "cantidad": "1 ración individual",
        "preparacion": ""
      },
      {
        "ingrediente": "Cebolla",
        "cantidad": "1/4 unidad pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Pimentón",
        "cantidad": "1/2 cucharada de café",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de café",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Brócoli al ajillo",
    "raciones": 1,
    "ingredientes": [
      "1 cucharada de café de aceite de oliva, virgen (2 g)",
      "1/2 cucharadita de paprika",
      "1 diente de ajo, triturado (4 g)",
      "1 taza de brócoli (150 g)"
    ],
    "preparacion": [
      "Calienta el aceite en un sartén pequeño a fuego mediano alto. Saltea el ajo hasta que se dore (sin que se queme). Retira del fuego y añade la paprika.",
      "Con un poco de agua y sal, calienta el brócoli (al vapor o en el microondas) por 3 minutos.",
      "Mezcla el brócoli con la “salsa” de ajo, paprika y aceite de oliva.",
      "Buen provecho."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de café",
        "preparacion": ""
      },
      {
        "ingrediente": "Paprika",
        "cantidad": "1/2 cucharadita",
        "preparacion": ""
      },
      {
        "ingrediente": "Ajo",
        "cantidad": "1 diente",
        "preparacion": ""
      },
      {
        "ingrediente": "Brócoli",
        "cantidad": "1 taza",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Sepia a la plancha con verduras",
    "raciones": 1,
    "ingredientes": [
      "Perejil al gusto",
      "1 diente de ajo, crudo (4 g)",
      "1/2 unidad grande de pimiento verde, crudo (80 g)",
      "1/2 unidad pequeña de pimiento rojo, crudo (75 g)",
      "1/2 unidad pequeña de cebolla blanca, cruda (40 g)",
      "1 porción individual de sepia, cruda (190 g)",
      "1 guarnición de berenjena, cruda (180 g)"
    ],
    "preparacion": [
      "Escurrir y limpiar la sepia y cortar en trozos pequeños. Marcar la sepia en la sartén a fuego fuerte con un poco de aceite de oliva hasta que veamos que cambia de color.",
      "Pelar y picar la cebolla y el ajo y cortar el tomate. Sofreír la cebolla y cuando poche, añadir la sepia. Añadir el resto de verduras y hacer a fuego lento. Si vemos que se nos puede quemar, podemos añadir algo de agua.",
      "Espolvorear perejil y salpimentar al gusto."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Perejil",
        "cantidad": "",
        "preparacion": ""
      },
      {
        "ingrediente": "Ajo",
        "cantidad": "1 diente",
        "preparacion": ""
      },
      {
        "ingrediente": "Pimiento verde",
        "cantidad": "1/2 unidad grande",
        "preparacion": ""
      },
      {
        "ingrediente": "Pimiento rojo",
        "cantidad": "1/2 unidad pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Cebolla",
        "cantidad": "1/2 unidad pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Sepia",
        "cantidad": "1 porción individual",
        "preparacion": ""
      },
      {
        "ingrediente": "Berenjena",
        "cantidad": "1 guarnición",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Sopa de pollo",
    "raciones": 1,
    "ingredientes": [
      "200 gramos de caldo vegetal",
      "60 gramos de pollo, pechuga, sin piel, crudo"
    ],
    "preparacion": [
      "Cocinar los vegetales (que quieras) hasta formar un caldo, colar si es necesario o dejar los vegetales.",
      "Trocear o procesar el pollo y cocinarlo en el caldo de vegetales.",
      "Servir con queso rallado o levadura nutricional en copos."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Caldo vegetal",
        "cantidad": "200 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Pechuga de pollo",
        "cantidad": "60 gramos",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Dorada asada",
    "raciones": 1,
    "ingredientes": [
      "1 dorada",
      "1/2 unidad mediana de cebolla blanca, cruda (70 g)",
      "1 diente de ajo, crudo (4 g)",
      "1/4 unidad mediana de limón, crudo (46 g)",
      "1/2 vaso de vino blanco, 11º (50 g)",
      "Perejil al gusto"
    ],
    "preparacion": [
      "Precalienta el horno a 200ºC.",
      "Sazona con sal y pimienta negra al gusto. Tras cortar la cebolla en juliana, ponla en la fuente.",
      "Vierte el vino y tapa la fuente con papel de aluminio. Lleva la fuente al horno y deja cocinar durante 25 minutos.",
      "Pela los dientes de ajo y pícalos muy finamente. Añádelos a un cuenco pequeño y echa sal, la pimienta molida y el perejil picado. Exprime el jugo de medio limón y remueve con unas varillas o un tenedor. Incorpora aceite de oliva y vuelve a mezclar. Añade el aliño en el interior de la dorada (previamente le habremos hecho un corte por la mitad).",
      "Corta en medias rodajas varios trozos de limón. Realiza varios cortes sobre la piel de la dorada e introduce en ellos las rodajas de limón.",
      "Pasados los 25 min., saca la fuente del horno y coloca la dorada por encima de la base de patatas y cebolla. Vuélvela a meter al horno durante 25 minutos más.",
      "Retirar y servir."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Dorada",
        "cantidad": "1",
        "preparacion": ""
      },
      {
        "ingrediente": "Cebolla",
        "cantidad": "1/2 unidad mediana",
        "preparacion": ""
      },
      {
        "ingrediente": "Ajo",
        "cantidad": "1 diente",
        "preparacion": ""
      },
      {
        "ingrediente": "Limón",
        "cantidad": "1/4 unidad mediana",
        "preparacion": ""
      },
      {
        "ingrediente": "Vino blanco",
        "cantidad": "1/2 vaso",
        "preparacion": ""
      },
      {
        "ingrediente": "Perejil",
        "cantidad": "",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Pollo con champiñones, zanahoria y arroz",
    "raciones": 1,
    "ingredientes": [
      "150 gramos de arroz blanco cocido",
      "100 gramos de pollo, pechuga, plancha",
      "120 gramos de champiñón, crudo",
      "1 unidad mediana de zanahoria, cruda (90 g)",
      "1 cucharada de café de aceite de oliva (2 g)"
    ],
    "preparacion": [
      "Lava y corta las verduras a rodajas. Saltea en una sartén caliente con AOVE hasta hacer, añade orégano y pimienta. Reserva. En la misma sartén pon la pechuga de pollo y hazla a la plancha. Si tu arroz está ya hervido o es de vasito, calienta en microondas 1 minuto y sirve junto con la verdura y el pollo. Como último paso puedes añadir el arroz a la sartén junto con la verdura y el pollo y mezclarlo todo."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Arroz blanco",
        "cantidad": "150 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Pechuga de pollo",
        "cantidad": "100 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Champiñones",
        "cantidad": "120 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Zanahoria",
        "cantidad": "1 unidad mediana",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de café",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Berenjena asada",
    "raciones": 1,
    "ingredientes": [
      "300 gramos de berenjena, cruda",
      "1 cucharada de café de aceite de oliva, virgen (2 g)",
      "1 gramo de pimienta, seca, molida"
    ],
    "preparacion": [
      "Lava y corta tu berenjena por la mitad a lo largo. Echa un chorrito de aceite y salpimenta al gusto. Mete al horno previamente calentado a 180ºC durante 20-30 minutos aprox o hasta que pinches y esté blandita."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Berenjena",
        "cantidad": "300 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de café",
        "preparacion": ""
      },
      {
        "ingrediente": "Pimienta negra",
        "cantidad": "1 gramo",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Ensalada campera",
    "raciones": 1,
    "ingredientes": [
      "1 cucharada de café de aceite de oliva, virgen (2 g)",
      "1 lata de atún (60 g)",
      "200-300gr de patata",
      "4 aceitunas verdes o negras",
      "1 tomate mediano (140 g)",
      "1-2 huevos cocidos"
    ],
    "preparacion": [
      "En primer lugar cocer las patatas en abundante agua con sal. Cocer también las judías verdes si son frescas o congeladas; si usas de las que vienen ya cocidas en bote, escurrir.",
      "Una vez cocidas partir en trozos medianos y mezclar con el resto de ingredientes cortados al gusto.",
      "Aliñar con aceite de oliva y servir."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de café",
        "preparacion": ""
      },
      {
        "ingrediente": "Atún",
        "cantidad": "1 lata",
        "preparacion": ""
      },
      {
        "ingrediente": "Patata",
        "cantidad": "200-300gr",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceitunas",
        "cantidad": "4",
        "preparacion": ""
      },
      {
        "ingrediente": "Tomate",
        "cantidad": "1",
        "preparacion": ""
      },
      {
        "ingrediente": "Huevos",
        "cantidad": "1-2",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Revuelto de espinacas y jamón serrano",
    "raciones": 1,
    "ingredientes": [
      "60gr de espinacas lavadas",
      "2 huevos",
      "Un puñado de jamón serrano a tacos",
      "1 cucharadita de AOVE"
    ],
    "preparacion": [
      "En una sartén echamos una cucharada de AOVE. Cuando esté caliente ponemos las espinacas, vamos rehogando hasta que reduzca su tamaño. Añadimos el jamón serrano sin dejar de remover, cuando veamos que el jamón ha cambiado de color incorporamos el huevo batido. Removemos todo hasta cuajar a nuestro gusto."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Espinacas",
        "cantidad": "60gr",
        "preparacion": ""
      },
      {
        "ingrediente": "Huevos",
        "cantidad": "2",
        "preparacion": ""
      },
      {
        "ingrediente": "Jamón serrano",
        "cantidad": "Un puñado",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharadita",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Revuelto de trigueros y atún",
    "raciones": 1,
    "ingredientes": [
      "2 huevos o 1 huevo y dos claras",
      "1 lata redonda grande de atún, enlatado al natural, escurrido (65 g)",
      "5-6 unidades de espárrago, verde (150 g)",
      "1 cucharada de postre de aceite de oliva, virgen (5 g)",
      "Pimienta molida al gusto"
    ],
    "preparacion": [
      "Limpia y corta los espárragos. En una sartén caliente echa el aceite y saltea los espárragos hasta que estén hechos. Por otro lado, bate bien los huevos hasta espumar y añade la lata de atún escurrida y la pimienta. Mezcla bien y vuelca en la sartén de los espárragos. Mezcla bien mientras se va cuajando el huevo mezclando todos los ingredientes hasta que tenga la cocción deseada."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Huevos",
        "cantidad": "2",
        "preparacion": ""
      },
      {
        "ingrediente": "Atún",
        "cantidad": "1 lata redonda grande",
        "preparacion": ""
      },
      {
        "ingrediente": "Espárragos verdes",
        "cantidad": "5-6 unidades",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de postre",
        "preparacion": ""
      },
      {
        "ingrediente": "Pimienta negra",
        "cantidad": "",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Huevos rellenos de tomate y atún",
    "raciones": 1,
    "ingredientes": [
      "2 unidades medianas de huevo de gallina, entero, crudo (100 g)",
      "1 lata redonda de atún, enlatado al natural, escurrido (65 g)",
      "2 cucharadas de tomate frito (20 g)"
    ],
    "preparacion": [
      "Cuece los huevos en 1/2 litro de agua durante 10 minutos a partir de que el agua comience a hervir. Saca, refresca con agua fría y pela.",
      "Córtalos a la mitad a lo largo y saca la yema. Mezcla la yema con el atún escurrido y el tomate frito. Rellena los huevos con esta mezcla y sirve.",
      "Consejo: servir sobre una base de ensalada de lechuga, tomate... para hacer un plato completo."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Huevos",
        "cantidad": "2 unidades",
        "preparacion": ""
      },
      {
        "ingrediente": "Atún",
        "cantidad": "1 lata redonda",
        "preparacion": ""
      },
      {
        "ingrediente": "Tomate frito",
        "cantidad": "2 cucharadas",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Ensalada de remolacha y queso de cabra",
    "raciones": 1,
    "ingredientes": [
      "1 ración individual de lechuga, cruda (70 g) o 70 g de canónigos o 70 g de espinaca o 40 gramos de endibia, cruda o 40 gramos de rúcula",
      "20 gramos de queso fresco de cabra",
      "1 mitad de remolacha cruda o de bote (70 g)",
      "1/2 unidad mediana de pepino, crudo (100 g)",
      "1/2 unidad “canario” de tomate maduro, crudo (38 g)",
      "1 cucharada sopera de arroz integral, hervido (20 g) o 2 cucharadas de quinoa cocida",
      "1 cucharada de café de aceite de oliva, virgen (2 g)",
      "4-5 almendras o 3 nueces"
    ],
    "preparacion": [
      "Lavar la base verde, luego cortar al gusto tomate, pepino y pelar la remolacha (si es cruda). Opcional: cortar la remolacha en láminas y saltearlas en poco aceite de oliva entre 2-4 minutos o si prefiere rallarla. Hacer el arroz/quinoa como dice el fabricante. Corta al gusto los frutos secos.",
      "Poner todos los ingredientes en un plato hondo o bol grande, dejar el queso para poner al final. Poner en un mortero aceite de oliva virgen + 1/4 diente ajo + hojas de perejil / albahaca fresca y chorrito de vinagre balsámico. Aderezar con esta mezcla si se desea o sólo con aceite de oliva."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Lechuga",
        "cantidad": "1 ración individual",
        "preparacion": ""
      },
      {
        "ingrediente": "Queso de cabra",
        "cantidad": "20 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Remolacha",
        "cantidad": "1",
        "preparacion": ""
      },
      {
        "ingrediente": "Pepino",
        "cantidad": "1/2 unidad mediana",
        "preparacion": ""
      },
      {
        "ingrediente": "Tomate",
        "cantidad": "",
        "preparacion": ""
      },
      {
        "ingrediente": "Arroz integral",
        "cantidad": "1 cucharada sopera",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de café",
        "preparacion": ""
      },
      {
        "ingrediente": "Almendras",
        "cantidad": "4-5",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Tortitas de avena y plátano (4 raciones, con harina de avena)",
    "raciones": 4,
    "ingredientes": [
      "2 unidades medianas de plátano, crudo (300 g)",
      "1 unidad grande de huevo de gallina, entero, crudo (65 g)",
      "1 cucharada de postre de canela, en polvo (3 g)",
      "1 gramo de sal común",
      "2 cucharadas de postre de levadura en polvo (10 g)",
      "50 gramos de leche, desnatada, UHT",
      "100 gramos de harina de avena"
    ],
    "preparacion": [
      "Solo tienes que pesar y añadir todos los ingredientes al vaso de la batidora. Batir hasta que quede lo más homogéneo posible.",
      "Prepara las tortitas en una sartén previamente untada con un poco aceite o mantequilla. Cada vez que hagas una tortita vuelve a untarla.",
      "Una vez has realizado todas las tortitas solo queda comerlas. Puedes acompañarlas con el topping que quieras: fruta, yogur, frutos secos, chocolate fundido, crema de cacahuete, etc."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Plátano",
        "cantidad": "2 unidades",
        "preparacion": ""
      },
      {
        "ingrediente": "Huevos",
        "cantidad": "1 unidad grande",
        "preparacion": ""
      },
      {
        "ingrediente": "Canela",
        "cantidad": "1 cucharada de postre",
        "preparacion": ""
      },
      {
        "ingrediente": "Sal",
        "cantidad": "1 gramo",
        "preparacion": ""
      },
      {
        "ingrediente": "Levadura en polvo",
        "cantidad": "2 cucharadas de postre",
        "preparacion": ""
      },
      {
        "ingrediente": "Leche",
        "cantidad": "50 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Harina de avena",
        "cantidad": "100 gramos",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Merluza con pisto y cous-cous",
    "raciones": 1,
    "ingredientes": [
      "1 diente de ajo, crudo (4 g)",
      "1/4 unidad grande de pimiento rojo, crudo (75 g)",
      "1 porción individual de merluza, cruda (180 g)",
      "1/2 unidad grande de pimiento verde, crudo (80 g)",
      "1 unidad “canario” de tomate maduro, crudo (75 g)",
      "1/2 unidad mediana de cebolla blanca, cruda (70 g)",
      "1 porción de cous-cous (50 g) / 100-120gr hervido",
      "1 cucharada de postre de aceite de oliva virgen extra (5 g)"
    ],
    "preparacion": [
      "Pon a hervir una taza de agua con un poco de sal y un poco de aceite de oliva. Antes de que rompa a hervir, añádele la taza de cuscús y apaga el fuego. Déjalo reposar hasta que se hidrate. Si hiciera falta echa un poco más de sal y de aceite, y remueve.",
      "Lava y pica la cebolla, los pimientos, los tomates y el ajo.",
      "En una sartén con aceite sofríe el ajo y la cebolla. A continuación añade los pimientos y saltea durante 4-5 minutos a fuego medio.",
      "Añade a la sartén el tomate natural cortado en dados y un poco de sal. Remueve para que se integre con el resto de ingredientes. Verás que poco a poco el agua de los tomates se irá absorbiendo. Pon el fuego suave y deja que se cocinen las verduras hasta que estén tiernas.",
      "Coloca el pisto en un recipiente apto para el horno. Sobre el pisto coloca las rodajas de merluza previamente salpimentadas por ambos lados y cocina en el horno a 200 °C durante 5-7 minutos. Saca el recipiente del horno, coloca la comida sobre tu plato y acompáñalo con un poco de cuscús.",
      "Si prefieres no emplear horno, puedes cocinar la merluza en la propia sartén que contiene el pisto. Entonces coloca la merluza en la sartén que contiene el pisto y cocinar a fuego suave unos 10-12 minutos. A mitad de cocción dales las vuelta para que se cocinen por ambos lados. Luego, sirve en los platos la merluza con el pisto y acompáñalos de varias cucharadas de cuscús."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Ajo",
        "cantidad": "1 diente",
        "preparacion": ""
      },
      {
        "ingrediente": "Pimiento rojo",
        "cantidad": "1/4 unidad grande",
        "preparacion": ""
      },
      {
        "ingrediente": "Merluza",
        "cantidad": "1 porción individual",
        "preparacion": ""
      },
      {
        "ingrediente": "Pimiento verde",
        "cantidad": "1/2 unidad grande",
        "preparacion": ""
      },
      {
        "ingrediente": "Tomate",
        "cantidad": "",
        "preparacion": ""
      },
      {
        "ingrediente": "Cebolla",
        "cantidad": "1/2 unidad mediana",
        "preparacion": ""
      },
      {
        "ingrediente": "Cous-cous",
        "cantidad": "",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de postre",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Ensalada de lentejas y mostaza",
    "raciones": 2,
    "ingredientes": [
      "150-200 gramos de lenteja, en conserva",
      "Un puñadito de canónigos o lechuga",
      "1 unidad pequeña de zanahoria, cruda (45 g)",
      "1/2 unidad pequeña de cebolla blanca, cruda (40 g)",
      "1 unidad mediana de tomate maduro, crudo (140 g)",
      "Zumo de limón o lima",
      "1 cucharada de postre de aceite de oliva, virgen (5 g)",
      "1 cucharada de postre de miel (8 g)",
      "1 lata redonda pequeña de atún al natural",
      "1 cucharadita de mostaza"
    ],
    "preparacion": [
      "Preparar las hortalizas. En primer lugar, raspa la zanahoria y limpia la cebolleta, y lava ambas. Y córtalas todas en juliana. Por último, lava los tomates y córtalos en tiras.",
      "Hacer la vinagreta. En un bol, mezcla el zumo del limón junto la miel, el comino, el aceite y una cucharada de mostaza.",
      "Enjuaga las lentejas cocidas y escúrrelas.",
      "Montar la ensalada y añade el pollo en tiras o las dos latas de atún. Riega con la vinagreta de miel y limón."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Lentejas",
        "cantidad": "150-200 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Canónigos",
        "cantidad": "Un",
        "preparacion": ""
      },
      {
        "ingrediente": "Zanahoria",
        "cantidad": "1 unidad pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Cebolla",
        "cantidad": "1/2 unidad pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Tomate",
        "cantidad": "1 unidad mediana",
        "preparacion": ""
      },
      {
        "ingrediente": "Limón",
        "cantidad": "",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de postre",
        "preparacion": ""
      },
      {
        "ingrediente": "Miel",
        "cantidad": "1 cucharada de postre",
        "preparacion": ""
      },
      {
        "ingrediente": "Atún",
        "cantidad": "1 lata redonda pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Mostaza",
        "cantidad": "1 cucharadita",
        "preparacion": ""
      }
    ],
    "alias": [
      "Ensalada de 150gr de lentejas y mostaza"
    ]
  },
  {
    "nombre": "Garbanzos con judías verdes",
    "raciones": 1,
    "ingredientes": [
      "1 guarnición de judía verde, cruda (140 g)",
      "1 unidad “canario” de tomate maduro, crudo (75 g)",
      "1 diente de ajo, crudo (4 g)",
      "1 unidad pequeña de zanahoria, cruda (45 g)",
      "1/4 unidad pequeña de pimiento rojo, crudo (38 g)",
      "1/4 unidad pequeña de pimiento verde, crudo (20 g)",
      "1 muslito de pollo, muslo, con piel, crudo (120 g)",
      "100-150 gramos de garbanzo, en conserva"
    ],
    "preparacion": [
      "Hacemos el sofrito con el ajito, tomate, pimiento verde, rojo y zanahoria en una sartén con un poquito de aceite. Todas las verduras deben de estar lavadas y cortadas previamente.",
      "Cuando se encuentre hecho el sofrito, añadimos las judías verdes (puedes utilizar de bote, ya vienen cocidas) y el muslo de pollo. Salpimentamos.",
      "Si vemos que falta aceite, añadimos un poco de agua o vino blanco para cocinar, esperando a que se evapore el alcohol.",
      "Finalmente, añadimos los garbanzos de bote (escurridos y lavados previamente), bajamos el fuego. Dejamos que se mezcle todo los sabores bien... ¡Y a comer!"
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Judías verdes",
        "cantidad": "1 guarnición",
        "preparacion": ""
      },
      {
        "ingrediente": "Tomate",
        "cantidad": "",
        "preparacion": ""
      },
      {
        "ingrediente": "Ajo",
        "cantidad": "1 diente",
        "preparacion": ""
      },
      {
        "ingrediente": "Zanahoria",
        "cantidad": "1 unidad pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Pimiento rojo",
        "cantidad": "1/4 unidad pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Pimiento verde",
        "cantidad": "1/4 unidad pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Muslo de pollo",
        "cantidad": "1",
        "preparacion": ""
      },
      {
        "ingrediente": "Garbanzos",
        "cantidad": "100-150 gramos",
        "preparacion": ""
      }
    ],
    "alias": [
      "130gr de garbanzos (en conserva) con judías verdes"
    ]
  },
  {
    "nombre": "Gazpacho",
    "raciones": 1,
    "ingredientes": [
      "2 unidades medianas de tomate maduro, crudo (280 g)",
      "1 cucharada de postre de aceite de oliva, virgen (5 g)",
      "1/2 cebolla",
      "1 unidad mediana de pepino, crudo (200 g)",
      "1 unidad mediana de pimiento verde, crudo (125 g)"
    ],
    "preparacion": [
      "Pelamos, limpiamos y cortamos la cebolla, los tomates, el pimiento y el pepino.",
      "Trituramos la verdura junto con un chorro de aceite de oliva.",
      "Enfriamos en la nevera y consumimos una vez que esté frío."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Tomate",
        "cantidad": "2 unidades",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de postre",
        "preparacion": ""
      },
      {
        "ingrediente": "Cebolla",
        "cantidad": "1/2",
        "preparacion": ""
      },
      {
        "ingrediente": "Pepino",
        "cantidad": "1 unidad mediana",
        "preparacion": ""
      },
      {
        "ingrediente": "Pimiento verde",
        "cantidad": "1 unidad mediana",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Espagueti de calabacín con berenjena, champiñones y carne picada",
    "raciones": 1,
    "ingredientes": [
      "80 gramos de calabacín, crudo",
      "120 gramos de carne picada de vacuno",
      "80 gramos de berenjena, cruda",
      "50 gramos de champiñón, crudo",
      "1 cucharada sopera de aceite de oliva, virgen (9 g)",
      "1 diente de ajo, crudo (4 g)",
      "1 sobre comercial de sal de mar (1 g)",
      "30 gramos de cebolla blanca, cruda"
    ],
    "preparacion": [
      "Usar el cortador en espiral para cortar el calabacín en forma de espiral.",
      "Calentar una sartén a fuego medio e introducir los espirales de calabacín.",
      "En una sartén aparte, cocinar la cebolla, el ajo, los champiñones y la berenjena previamente cortados en cuadraditos pequeños con el aceite de oliva.",
      "Cocinar la carne picada e introducir las verduras.",
      "Poner los espirales de calabacín junto a los demás ingredientes y seguir cocinando en una sartén."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Calabacín",
        "cantidad": "80 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Carne picada de vacuno",
        "cantidad": "120 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Berenjena",
        "cantidad": "80 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Champiñones",
        "cantidad": "50 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada sopera",
        "preparacion": ""
      },
      {
        "ingrediente": "Ajo",
        "cantidad": "1 diente",
        "preparacion": ""
      },
      {
        "ingrediente": "Sal",
        "cantidad": "1 sobre",
        "preparacion": ""
      },
      {
        "ingrediente": "Cebolla",
        "cantidad": "30 gramos",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Sepia a la plancha",
    "raciones": 1,
    "ingredientes": [
      "1 diente de ajo, crudo (4 g)",
      "1 cucharada sopera de perejil, fresco (3 g)",
      "1 porción individual de sepia, cruda (190 g)"
    ],
    "preparacion": [
      "Cuando el aceite se encuentre caliente, añadimos la sepia. Salpimentamos."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Ajo",
        "cantidad": "1 diente",
        "preparacion": ""
      },
      {
        "ingrediente": "Perejil",
        "cantidad": "1 cucharada sopera",
        "preparacion": ""
      },
      {
        "ingrediente": "Sepia",
        "cantidad": "1 porción individual",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Arroz blanco cocido",
    "raciones": 1,
    "ingredientes": [
      "50 gramos de arroz blanco grano mediano crudo",
      "Doble de agua que de arroz",
      "1 diente de ajo, crudo (4 g)",
      "1 cucharada de postre de aceite de oliva, virgen (5 g)"
    ],
    "preparacion": [
      "Saltea el ajo en un cazo con un poco de aceite hasta dorar. Añade el arroz y mezcla con el ajo y aceite hasta impregnar. Añade el agua, mezcla y deja cocer a fuego medio hasta absorber todo el agua. Aprox 15 minutos. Tapa y deja reposar a fuego muy bajo 10 minutos más."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Arroz blanco",
        "cantidad": "50 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Agua",
        "cantidad": "Doble",
        "preparacion": ""
      },
      {
        "ingrediente": "Ajo",
        "cantidad": "1 diente",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de postre",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Crema de calabaza",
    "raciones": 1,
    "ingredientes": [
      "Agua",
      "1/2 unidad pequeña de cebolla blanca, cruda (40 g)",
      "200 gramos de calabaza, cruda"
    ],
    "preparacion": [
      "Pelar la calabaza, retirarle las semillas y cortarla en cubos grandes. Hacer lo mismo con la cebolla.",
      "Colocar los trozos de calabaza y cebolla a hervir en 500ml de agua con un puñado de sal gruesa. Mantener la cacerola tapada para evitar desperdicio de líquido por ebullición.",
      "Una vez cocida la calabaza, minipimear finamente y servir en consomeras.",
      "Puede agregarse queso rallado en hebras o croutones de pan (siempre y cuando la persona pueda consumir sodio o no sufra de hipertensión)."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Agua",
        "cantidad": "",
        "preparacion": ""
      },
      {
        "ingrediente": "Cebolla",
        "cantidad": "1/2 unidad pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Calabaza",
        "cantidad": "200 gramos",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Brochetas de pollo",
    "raciones": 1,
    "ingredientes": [
      "1 diente de ajo, crudo (4 g)",
      "200 gramos de agua, sin gas, embotellada",
      "3 cucharadas soperas de salsa de soja (39 g)",
      "3 cucharadas soperas de vinagre (27 g)",
      "1 filete de pollo, pechuga, sin piel, crudo (175 g)"
    ],
    "preparacion": [
      "Marinar el pollo con la mezcla de vinagre, soja, el ajo bien picado y agua.",
      "Añadir sal y orégano, pinchar en la brocheta y hacer a la plancha.",
      "Condimentar y servir."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Ajo",
        "cantidad": "1 diente",
        "preparacion": ""
      },
      {
        "ingrediente": "Agua",
        "cantidad": "200 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Salsa de soja",
        "cantidad": "3 cucharadas soperas",
        "preparacion": ""
      },
      {
        "ingrediente": "Vinagre",
        "cantidad": "3 cucharadas soperas",
        "preparacion": ""
      },
      {
        "ingrediente": "Pechuga de pollo",
        "cantidad": "1 filete",
        "preparacion": ""
      }
    ],
    "alias": [
      "1-2 brochetas de pavo / pollo"
    ]
  },
  {
    "nombre": "Gachas de avena al microondas con fruta",
    "raciones": 1,
    "ingredientes": [
      "30-40 gramos de avena en copos, para el desayuno",
      "Pieza de fruta",
      "Canela",
      "1 cucharada de semillas de chía",
      "1 vaso de agua 250ml o 1 taza de leche o bebida vegetal"
    ],
    "preparacion": [
      "Pon en un recipiente la avena y cubre de agua totalmente. Mete a tu microondas a máxima potencia dos minutos aproximadamente o hasta que veas que la avena sube. Añade la fruta cortada y las semillas de chía. Se puede tomar caliente o frío."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Avena en copos",
        "cantidad": "30-40 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Fruta",
        "cantidad": "",
        "preparacion": ""
      },
      {
        "ingrediente": "Canela",
        "cantidad": "",
        "preparacion": ""
      },
      {
        "ingrediente": "Semillas de chía",
        "cantidad": "1 cucharada",
        "preparacion": ""
      },
      {
        "ingrediente": "Leche",
        "cantidad": "1 vaso",
        "preparacion": ""
      }
    ],
    "alias": [
      "Gachas de 30-40gr de avena al microondas con fruta"
    ]
  },
  {
    "nombre": "Ñoquis salteados",
    "raciones": 1,
    "ingredientes": [
      "100-120 gramos de ñoquis"
    ],
    "preparacion": [
      "Calienta una sartén a fuego alto y cuando esté caliente añade los ñoquis removiendo de vez en cuando para hacerse por ambos lados por igual. Cuando esté a tu gusto (pasados unos minutos) retira y sirve."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Ñoquis",
        "cantidad": "100-120 gramos",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Tortilla de verduras",
    "raciones": 1,
    "ingredientes": [
      "1 cucharada de café de aceite de oliva, virgen (2 g)",
      "2 unidades grandes de huevo de gallina, entero, crudo (130 g)",
      "70 gramos de brócoli crudo",
      "1/4 de cebolla",
      "Ajetes tiernos al gusto",
      "1/4 unidad pequeña de pimiento rojo, crudo (38 g)",
      "1/4 unidad mediana de calabacín, crudo (80 g)"
    ],
    "preparacion": [
      "Limpiar y trocear todas las verduras.",
      "Poner en una sartén el aceite de oliva y rehogar todos los ingredientes hasta que estén tiernos.",
      "Batir los huevos.",
      "Salpimentar y escurrir el aceite y cualquier líquido que haya en la sartén.",
      "Cuajar la tortilla hasta que esté dorada por ambas caras y servir."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de café",
        "preparacion": ""
      },
      {
        "ingrediente": "Huevos",
        "cantidad": "2 unidades grandes",
        "preparacion": ""
      },
      {
        "ingrediente": "Brócoli",
        "cantidad": "70 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Cebolla",
        "cantidad": "1/4",
        "preparacion": ""
      },
      {
        "ingrediente": "Ajetes tiernos",
        "cantidad": "",
        "preparacion": ""
      },
      {
        "ingrediente": "Pimiento rojo",
        "cantidad": "1/4 unidad pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Calabacín",
        "cantidad": "1/4 unidad mediana",
        "preparacion": ""
      }
    ],
    "alias": [
      "Tortilla de 2 huevos con verduras"
    ]
  },
  {
    "nombre": "Gachas de avena y arándanos",
    "raciones": 1,
    "ingredientes": [
      "40 gramos de avena, grano, arrollada, cruda",
      "15 unidades de arándanos congelados o puñado de arándanos frescos (20-30 g)",
      "1 pizca de canela opcional",
      "1 cucharadita de esencia de vainilla (3 g)",
      "Edulcorante (opcional)",
      "1 vaso de bebida de almendra o leche de vaca semidesnatada"
    ],
    "preparacion": [
      "Poner la avena y la leche en una sartén grande hasta que hierva.",
      "Bajar el fuego, agregar los arándanos y cocinar a fuego medio, revolviendo ocasionalmente hasta que la papilla se espese y la avena esté cocida, aproximadamente de 4 a 5 minutos. ¡La papilla se volverá de un tono púrpura oscuro!",
      "Agregar la canela y la vainilla.",
      "Una vez que tenga la consistencia deseada (¡la papilla gruesa queda muy bien!), verter la papilla en un tazón. Cubrir con unos arándanos extras, rodajas de banana y una llovizna de miel o jarabe de arce."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Avena en copos",
        "cantidad": "40 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Arándanos",
        "cantidad": "15 unidades",
        "preparacion": ""
      },
      {
        "ingrediente": "Canela",
        "cantidad": "1 pizca",
        "preparacion": ""
      },
      {
        "ingrediente": "Esencia de vainilla",
        "cantidad": "1 cucharadita",
        "preparacion": ""
      },
      {
        "ingrediente": "Edulcorante",
        "cantidad": "",
        "preparacion": ""
      },
      {
        "ingrediente": "Bebida de almendra",
        "cantidad": "1 vaso",
        "preparacion": ""
      }
    ],
    "alias": [
      "Gachas de 30-40gr de avena y arándanos"
    ]
  },
  {
    "nombre": "Boquerones con ajo y perejil y rodajas de tomate al horno",
    "raciones": 1,
    "ingredientes": [
      "120 gramos de boquerón, crudo",
      "1 tomate",
      "1 ajo",
      "1 cucharada sopera de perejil, fresco (3 g)",
      "1 cucharada de postre de aceite de oliva (5 g)"
    ],
    "preparacion": [
      "Precalentar el horno. Colocar una base de rodajas de tomate en la bandeja del horno.",
      "Colocar los boquerones limpios encima de la base de tomate. Espolvorear con el ajo y el perejil bien picados.",
      "Hornear unos 20 minutos a 200ºC."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Boquerones",
        "cantidad": "120 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Tomate",
        "cantidad": "1",
        "preparacion": ""
      },
      {
        "ingrediente": "Ajo",
        "cantidad": "1",
        "preparacion": ""
      },
      {
        "ingrediente": "Perejil",
        "cantidad": "1 cucharada sopera",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de postre",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Ensalada de repollo y zanahoria",
    "raciones": 1,
    "ingredientes": [
      "1 unidad pequeña de zanahoria, cruda (45 g)",
      "1/2 pieza de limón (34 g)",
      "Una cucharada de mayonesa",
      "Pimienta negra molida",
      "1 guarnición de col repollo, cruda (170 g)"
    ],
    "preparacion": [
      "Lavar y pelar las zanahorias.",
      "Rallar o cortar en tiras el repollo y las zanahorias, lo que sea más rápido o cómodo para ti.",
      "Preparar el aderezo con el limón, la mayonesa, pimienta y sal al gusto. Mezclar bien y agregar el aderezo a la ensalada. Mezclar muy bien todos los ingredientes."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Zanahoria",
        "cantidad": "1 unidad pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Limón",
        "cantidad": "1/2",
        "preparacion": ""
      },
      {
        "ingrediente": "Mayonesa",
        "cantidad": "Una cucharada",
        "preparacion": ""
      },
      {
        "ingrediente": "Pimienta negra",
        "cantidad": "",
        "preparacion": ""
      },
      {
        "ingrediente": "Col repollo",
        "cantidad": "1 guarnición",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Brócoli y champiñón en salsa de soja",
    "raciones": 2,
    "ingredientes": [
      "200 gramos de brócoli",
      "150 gramos de champiñón, crudo",
      "1/2 unidad pequeña de cebolla blanca",
      "2 cucharadas soperas de salsa de soja (26 g)",
      "Jengibre rallado al gusto",
      "1 cucharada de postre de aceite de oliva, virgen (5 g)"
    ],
    "preparacion": [
      "Limpia los champiñones y córtalos en cuatro piezas. Limpia el brócoli y corta los ramilletes. Pica la cebolla lo más pequeño posible. En una sartén echa un chorrito de aceite y cuando esté caliente añade la cebolla, saltea hasta que esté pochada y cambie de color. Añade el brócoli y saltea para mezclar, tapa la sartén y deja a fuego medio un par de minutos, moviendo de vez en cuando. Cuando veas que el brócoli está a medio hacer añade los champiñones y saltea todo. Déjalo cocer un par de minutos más con la tapa puesta. Añade el jengibre rallado y mezcla. Finalmente añade la salsa de soja, mezcla bien y deja que evapore. Sirve con unas semillas de sésamo para decorar."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Brócoli",
        "cantidad": "200 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Champiñones",
        "cantidad": "150 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Cebolla",
        "cantidad": "1/2 unidad pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Salsa de soja",
        "cantidad": "2 cucharadas soperas",
        "preparacion": ""
      },
      {
        "ingrediente": "Jengibre",
        "cantidad": "",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de postre",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Puerros asados en airfryer u horno",
    "raciones": 1,
    "ingredientes": [
      "2 unidades medianas de puerro, crudo (300 g)",
      "1 cucharada de postre de aceite de oliva, virgen (5 g)",
      "Hierbas provenzales",
      "1 sobre comercial de sal común (1 g)",
      "2 dientes de ajo, crudo (8 g)"
    ],
    "preparacion": [
      "Corta los puerros por la mitad y las mitades a lo largo. Coloca con el centro hacia arriba en un recipiente apto para horno o airfryer. En un bol pon una o dos cucharadas de AOVE (depende de la cantidad de puerros), añade una pizca de sal y media cucharadita de especias. Mezcla bien y con una brochita baña tus puerros. Ahora pica los ajos y añádelos por encima. Colocamos en nuestra airfryer precalentada previamente a 180ºC durante 15-20'. Si usas horno unos 25' a 180ºC."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Puerro",
        "cantidad": "2 unidades",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de postre",
        "preparacion": ""
      },
      {
        "ingrediente": "Hierbas provenzales",
        "cantidad": "",
        "preparacion": ""
      },
      {
        "ingrediente": "Sal",
        "cantidad": "1 sobre",
        "preparacion": ""
      },
      {
        "ingrediente": "Ajo",
        "cantidad": "2 dientes",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Escalivada de verduras",
    "raciones": 2,
    "ingredientes": [
      "1 porción de pimientos asados (150 g)",
      "300 gramos de berenjena, hervida",
      "1 gramo de aceite de oliva virgen extra",
      "200 gramos de cebolla, asada",
      "2 dientes de ajo, crudo (8 g)"
    ],
    "preparacion": [
      "Meter los pimientos rojos, los ajos, la cebolla y las berenjenas en bolsas de asar al horno.",
      "Pinchar un poco las bolsas.",
      "Horno a 180º o 200º durante una hora aprox.",
      "Esperar a que se pongan tibias y pelar.",
      "Rociar con un poco de AOVE."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Pimientos asados",
        "cantidad": "1 porción",
        "preparacion": ""
      },
      {
        "ingrediente": "Berenjena",
        "cantidad": "300 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 gramo",
        "preparacion": ""
      },
      {
        "ingrediente": "Cebolla",
        "cantidad": "200 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Ajo",
        "cantidad": "2 dientes",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Espinacas con garbanzos",
    "raciones": 1,
    "ingredientes": [
      "1 ración individual de espinaca, cruda (90 g)",
      "1 cucharada de café de aceite de oliva, virgen (2 g)",
      "1 diente de ajo, crudo (4 g)",
      "100 gramos de garbanzo, en conserva",
      "1/2 cucharada de café de pimentón, en polvo (2 g)"
    ],
    "preparacion": [
      "Lavar y escurrir los garbanzos. Saltear las espinacas en sartén con aceite hasta reducir su tamaño. Añadir el pimentón y remover para que no se queme. Añadir los garbanzos y mezclar. Salpimentar al gusto, mezclar y servir."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Espinacas",
        "cantidad": "1 ración individual",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de café",
        "preparacion": ""
      },
      {
        "ingrediente": "Ajo",
        "cantidad": "1 diente",
        "preparacion": ""
      },
      {
        "ingrediente": "Garbanzos",
        "cantidad": "100 gramos",
        "preparacion": ""
      },
      {
        "ingrediente": "Pimentón",
        "cantidad": "1/2 cucharada de café",
        "preparacion": ""
      }
    ],
    "alias": [
      "Espinacas con 150gr de garbanzos (en conserva)"
    ]
  },
  {
    "nombre": "Ensalada mixta",
    "raciones": 1,
    "ingredientes": [
      "Zumo de medio limón",
      "1 cucharadita de aceite de oliva extra virgen (5 g)",
      "1 guarnición de lechuga, cruda (35 g)",
      "Medio tomate (50 g)",
      "1/4 taza de cebolla morada rebanada (29 g)",
      "1 pizca de sal",
      "Pimienta al gusto",
      "1/2 unidad pequeña de zanahoria, cruda (23 g)",
      "1/2 unidad mediana de pepino, crudo (100 g)"
    ],
    "preparacion": [
      "Prepare el aderezo mezclando el cilantro picado, el jugo de limón, el aceite, la sal y pimienta.",
      "Ponga la lechuga, tomates, cebolla y aguacate en una fuente para ensaladas.",
      "Añada el aderezo a las verduras y mezcle bien."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Limón",
        "cantidad": "",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharadita",
        "preparacion": ""
      },
      {
        "ingrediente": "Lechuga",
        "cantidad": "1 guarnición",
        "preparacion": ""
      },
      {
        "ingrediente": "Tomate",
        "cantidad": "Medio",
        "preparacion": ""
      },
      {
        "ingrediente": "Cebolla morada",
        "cantidad": "1/4 taza",
        "preparacion": ""
      },
      {
        "ingrediente": "Sal",
        "cantidad": "1 pizca",
        "preparacion": ""
      },
      {
        "ingrediente": "Pimienta negra",
        "cantidad": "",
        "preparacion": ""
      },
      {
        "ingrediente": "Zanahoria",
        "cantidad": "1/2 unidad pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Pepino",
        "cantidad": "1/2 unidad mediana",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Sopa de pollo (consomé)",
    "raciones": 1,
    "ingredientes": [
      "200 gramos de caldo vegetal"
    ],
    "preparacion": [
      "Cocinar los vegetales (que quieras) hasta formar un caldo, colar si es necesario o dejar los vegetales.",
      "Puedes comprar el caldo ya hecho y solamente calentar."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Caldo vegetal",
        "cantidad": "200 gramos",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Merluza al papillote con verduras",
    "raciones": 1,
    "ingredientes": [
      "1 porción individual de merluza, cruda (180 g)",
      "1/2 unidad pequeña de zanahoria, cruda (23 g)",
      "1/2 unidad pequeña de pimiento verde, crudo (40 g)",
      "1/4 unidad mediana de calabacín, crudo (80 g)",
      "1/4 unidad mediana de cebolla blanca, cruda (35 g)",
      "1/2 unidad mediana de puerro, crudo (75 g)",
      "1 cucharada de postre de aceite de oliva virgen extra (5 g)"
    ],
    "preparacion": [
      "Pelamos la cebolleta y la picamos, hacemos lo mismo con el resto de verduras, todo picadito finamente. Lo salteamos a fuego fuerte en una sartén con un chorrito de aceite de oliva virgen extra y un poco de sal. No hay que cocinarlo en exceso ya que luego se terminan en el horno.",
      "En un trozo de papel aluminio ponemos una cama con estas verduras, encima colocamos el trozo de merluza, añadimos un chorrito de aceite de oliva virgen extra y formamos un paquete con el papel bien cerrado. Metemos estos paquetes en el horno, precalentado, a 180ºC unos 8 o 10 minutos. Servimos los paquetes en el plato, cuando los abramos desprenderán todo el aroma."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Merluza",
        "cantidad": "1 porción individual",
        "preparacion": ""
      },
      {
        "ingrediente": "Zanahoria",
        "cantidad": "1/2 unidad pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Pimiento verde",
        "cantidad": "1/2 unidad pequeña",
        "preparacion": ""
      },
      {
        "ingrediente": "Calabacín",
        "cantidad": "1/4 unidad mediana",
        "preparacion": ""
      },
      {
        "ingrediente": "Cebolla",
        "cantidad": "1/4 unidad mediana",
        "preparacion": ""
      },
      {
        "ingrediente": "Puerro",
        "cantidad": "1/2 unidad mediana",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de postre",
        "preparacion": ""
      }
    ],
    "alias": []
  },
  {
    "nombre": "Tortilla a la francesa con jamón de york",
    "raciones": 1,
    "ingredientes": [
      "2 huevos",
      "2 lonchas de jamón cocido, extra (60 g)",
      "1 cucharada de postre de aceite de oliva, virgen (5 g)",
      "2 claras de huevo"
    ],
    "preparacion": [
      "Bate huevos y claras hasta espumar. Incorpora el jamón de york cortado en porciones pequeñas y mezcla. En una sartén caliente echa un poco de aceite y echa los huevos. Cocina hasta tener el cuajado deseado y sirve."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Huevos",
        "cantidad": "2",
        "preparacion": ""
      },
      {
        "ingrediente": "Jamón cocido",
        "cantidad": "2 lonchas",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de postre",
        "preparacion": ""
      },
      {
        "ingrediente": "Huevos",
        "cantidad": "2",
        "preparacion": ""
      }
    ],
    "alias": [
      "Tortilla a la francesa de 2 huevos con jamón de york"
    ]
  },
  {
    "nombre": "Pollo a la plancha marinado",
    "raciones": 1,
    "ingredientes": [
      "1/4 vaso de limón, zumo, fresco (44 g)",
      "1 cucharada de postre de aceite de oliva, virgen (5 g)",
      "1 diente de ajo, crudo (4 g)",
      "Finas hierbas al gusto",
      "130gr de pollo, pechuga, sin piel, crudo",
      "Sal"
    ],
    "preparacion": [
      "En una fuente donde se servirá el plato colocar ajo picado, jugo de limón y aceite de oliva. Añadir hierbas aromáticas frescas finamente picadas (perejil, cilantro, albahaca, eneldo).",
      "Calentar a fuego medio una sartén para asar. Engrasar con un poco de aceite de oliva. Salpimentar las pechugas y colocarlas en la sartén, volteando de lado hasta que estén cocidas.",
      "Colocar sobre las pechugas la salsa de hierbas y revolver hasta que estén bien integrados los ingredientes."
    ],
    "ingredientesEnPiezas": [
      {
        "ingrediente": "Limón",
        "cantidad": "1/4 vaso",
        "preparacion": ""
      },
      {
        "ingrediente": "Aceite de oliva virgen extra",
        "cantidad": "1 cucharada de postre",
        "preparacion": ""
      },
      {
        "ingrediente": "Ajo",
        "cantidad": "1 diente",
        "preparacion": ""
      },
      {
        "ingrediente": "Finas hierbas",
        "cantidad": "",
        "preparacion": ""
      },
      {
        "ingrediente": "Pechuga de pollo",
        "cantidad": "130gr",
        "preparacion": ""
      },
      {
        "ingrediente": "Sal",
        "cantidad": "",
        "preparacion": ""
      }
    ],
    "alias": []
  }
];

// El nombre pelado, sin cantidades ni formatos: en la despensa marcas
// "lentejas", y la receta ya dice "150 gramos de lenteja, en conserva".
export const INGREDIENTES = [
  "Aceite de oliva virgen extra",
  "Aceitunas",
  "Aguacate",
  "Ajetes tiernos",
  "Ajo",
  "Albahaca",
  "Alcachofas",
  "Almendras",
  "Alubias",
  "Apio",
  "Arroz blanco",
  "Arroz integral",
  "Arándanos",
  "Atún",
  "Avena en copos",
  "Avena molida",
  "Bacalao",
  "Bebida de almendra",
  "Bebida de avena",
  "Berenjena",
  "Boniato",
  "Boquerones",
  "Brócoli",
  "Burrata",
  "Cacao desgrasado",
  "Calabacín",
  "Calabaza",
  "Caldo vegetal",
  "Canela",
  "Canónigos",
  "Carne picada de cerdo",
  "Carne picada de vacuno",
  "Cebolla",
  "Cebolla morada",
  "Cereales sin azúcar",
  "Champiñones",
  "Champiñones portobello",
  "Chocolate negro",
  "Clementina",
  "Col repollo",
  "Cous-cous",
  "Cúrcuma",
  "Dorada",
  "Edulcorante",
  "Endibia",
  "Esencia de vainilla",
  "Espinacas",
  "Espárragos blancos",
  "Espárragos verdes",
  "Fresa",
  "Garbanzos",
  "Guisantes",
  "Harina de avena",
  "Hierbas provenzales",
  "Huevos",
  "Jamón cocido",
  "Jamón serrano",
  "Jengibre",
  "Judías verdes",
  "Kiwi",
  "Kéfir",
  "Laurel",
  "Leche",
  "Lechuga",
  "Lentejas",
  "Levadura en polvo",
  "Limón",
  "Lubina",
  "Manzana",
  "Mayonesa",
  "Melocotón",
  "Melón",
  "Menestra",
  "Merluza",
  "Mermelada sin azúcar",
  "Miel",
  "Mostaza",
  "Mostaza dijón",
  "Mozzarella",
  "Muslo de pollo",
  "Naranja",
  "Nueces",
  "Nuez moscada",
  "Orégano",
  "Pan de espelta",
  "Pan rallado",
  "Papaya",
  "Paprika",
  "Pasta",
  "Pasta de lentejas",
  "Patata",
  "Pechuga de pavo",
  "Pechuga de pollo",
  "Pepino",
  "Pera",
  "Perejil",
  "Pimentón",
  "Pimienta negra",
  "Pimiento rojo",
  "Pimiento verde",
  "Pimientos asados",
  "Piña",
  "Plátano",
  "Puerro",
  "Queso batido",
  "Queso de burgos",
  "Queso de cabra",
  "Quinoa",
  "Remolacha",
  "Repollo morado",
  "Requesón",
  "Romero",
  "Rúcula",
  "Sal",
  "Salmón",
  "Salmón ahumado",
  "Salsa de soja",
  "Semillas de chía",
  "Semillas de sésamo",
  "Sepia",
  "Ternera",
  "Tomate",
  "Tomate frito",
  "Tomillo",
  "Uvas",
  "Vinagre",
  "Vinagre de Módena",
  "Vino blanco",
  "Yogur de proteínas",
  "Yogur natural",
  "Yogur vegetal",
  "Zanahoria",
  "Ñoquis",
  "Agua",
  "Fruta",
  "Café",
  "Queso fresco",
  "Finas hierbas"
];

// Del recorte de una linea de receta al nombre bueno de la despensa (spec 090).
// Sale de docs/menus/sinonimos-ingredientes.json, revisado a mano.
export const SINONIMOS = new Map(Object.entries({
  "aceite de oliva": "aceite de oliva virgen extra",
  "aove": "aceite de oliva virgen extra",
  "pimienta": "pimienta negra",
  "chia": "semillas de chía",
  "esparrago": "espárragos verdes",
  "muslito de pollo": "muslo de pollo",
  "carne molida cerdo": "carne picada de cerdo",
  "avena": "avena en copos",
  "pollo": "pechuga de pollo",
  "pavo": "pechuga de pavo",
  "agua que de arroz": "agua",
  "fruta a tu eleccion": "fruta",
  "pieza de fruta": "fruta",
  "pimienta molida": "pimienta negra",
  "repollo a tiras": "col repollo",
  "cafe": "café",
  "esparragos": "espárragos verdes"
}));

// Ya con los siete días montados. Ver el comentario del generador sobre de
// dónde sale cada uno.
export const MENUS = [
  {
    "numero": 1,
    "nombre": "Menú 1",
    "dias": [
      {
        "dia": "lunes",
        "comidas": [
          {
            "momento": "desayuno",
            "texto": "1 taza de café con bebida de avena. 125gr de yogur vegetal con fruta y 30gr de cereal sin azúcar (arroz, quinoa, maíz, sin gluten...). A media mañana: taza de infusión y pieza de fruta (arándanos, naranja, clementina, papaya, kiwi, melón, piña, plátano, uvas)"
          },
          {
            "momento": "comida",
            "texto": "125gr de arroz (hervido) con verduras. Muslo de pollo asado / 120gr de pechuga de pollo"
          },
          {
            "momento": "merienda",
            "texto": "125gr de queso batido / yogur natural de proteínas / kéfir"
          },
          {
            "momento": "cena",
            "texto": "Tortilla de 2 huevos con pimiento rojo, berenjena y jamón serrano"
          }
        ]
      },
      {
        "dia": "martes",
        "comidas": [
          {
            "momento": "desayuno",
            "texto": "1 taza de café con bebida de avena. Tortitas de 40gr de avena y plátano. A media mañana: taza de infusión y pieza de fruta (arándanos, naranja, clementina, papaya, kiwi, melón, piña, plátano, uvas)"
          },
          {
            "momento": "comida",
            "texto": "Berenjena rellena de atún"
          },
          {
            "momento": "merienda",
            "texto": "Pudding de chía y mermelada sin azúcar"
          },
          {
            "momento": "cena",
            "texto": "Champiñones en salsa de soja. 120gr de sardinas / boquerones asados (cualquier pescado azul)"
          }
        ]
      },
      {
        "dia": "miércoles",
        "comidas": [
          {
            "momento": "desayuno",
            "texto": "1 taza de café con bebida de avena. Pudding de chía, 30gr de avena y fruta. A media mañana: taza de infusión y pieza de fruta (arándanos, naranja, clementina, papaya, kiwi, melón, piña, plátano, uvas)"
          },
          {
            "momento": "comida",
            "texto": "50gr de pasta integral / de lentejas (en seco) a la boloñesa (110gr de carne picada)"
          },
          {
            "momento": "merienda",
            "texto": "125gr de queso batido / yogur natural de proteínas / kéfir"
          },
          {
            "momento": "cena",
            "texto": "Crema de puerro y calabacín. Tortilla de 2 huevos y una lata de atún al natural"
          }
        ]
      },
      {
        "dia": "jueves",
        "comidas": [
          {
            "momento": "desayuno",
            "texto": "1 taza de café con bebida de avena. 1 rebanada de pan de espelta 100% Mercadona. 3 lonchas de jamón York Aldi. A media mañana: taza de infusión y pieza de fruta (arándanos, naranja, clementina, papaya, kiwi, melón, piña, plátano, uvas)"
          },
          {
            "momento": "comida",
            "texto": "Bacalao al papillote con verduras (cualquier pescado blanco)"
          },
          {
            "momento": "merienda",
            "texto": "Pudding de chía y mermelada sin azúcar"
          },
          {
            "momento": "cena",
            "texto": "Alcachofas a la plancha con mostaza. 1-2 huevos a la plancha"
          }
        ]
      },
      {
        "dia": "viernes",
        "comidas": [
          {
            "momento": "desayuno",
            "texto": "1 taza de café con bebida de avena. 125gr de yogur vegetal con fruta y 30gr de cereal sin azúcar (arroz, quinoa, maíz, sin gluten...). A media mañana: taza de infusión y pieza de fruta (arándanos, naranja, clementina, papaya, kiwi, melón, piña, plátano, uvas)"
          },
          {
            "momento": "comida",
            "texto": "100 gramos de guisantes con ajo y cebolla. Brochetas de pavo y calabacín (puede ser compradas en el súper)"
          },
          {
            "momento": "merienda",
            "texto": "125gr de queso batido / yogur natural de proteínas / kéfir"
          },
          {
            "momento": "cena",
            "texto": "Salteado de pollo, brócoli y champiñones"
          }
        ]
      },
      {
        "dia": "sábado",
        "comidas": [
          {
            "momento": "desayuno",
            "texto": "1 taza de café con bebida de avena. Tortitas de 40gr de avena y plátano. A media mañana: pieza de fruta (arándanos, naranja, clementina, papaya, kiwi, melón, piña, plátano, uvas)"
          },
          {
            "momento": "comida",
            "texto": "Lubina al horno con tomates y trigueros"
          },
          {
            "momento": "merienda",
            "texto": "Pudding de chía y canela"
          },
          {
            "momento": "cena",
            "texto": "Ensalada de espinacas, tomate, aguacate y atún. Pechugas de pavo a la plancha especiado con jengibre y cúrcuma"
          }
        ]
      },
      {
        "dia": "domingo",
        "comidas": [
          {
            "momento": "desayuno",
            "texto": ""
          },
          {
            "momento": "comida",
            "texto": ""
          },
          {
            "momento": "merienda",
            "texto": ""
          },
          {
            "momento": "cena",
            "texto": ""
          }
        ]
      }
    ]
  },
  {
    "numero": 2,
    "nombre": "Menú 2",
    "dias": [
      {
        "dia": "lunes",
        "comidas": [
          {
            "momento": "desayuno",
            "texto": "Café con bebida vegetal. Tortitas de 30gr de avena y plátano. A media mañana: pieza de fruta"
          },
          {
            "momento": "comida",
            "texto": "Calabacín a la plancha o brócoli al ajillo. 100-125 gramos de arroz integral, hervido. Pechuga / muslo de pollo a la plancha"
          },
          {
            "momento": "merienda",
            "texto": "125 gramos de kéfir / yogur natural / yogur vegetal / yogur de proteínas + canela / mermelada sin azúcar / cacao desgrasado"
          },
          {
            "momento": "cena",
            "texto": "Berenjena a la plancha. 1-2 filetes de lubina a la plancha (90-180gr)"
          }
        ]
      },
      {
        "dia": "martes",
        "comidas": [
          {
            "momento": "desayuno",
            "texto": "Café con bebida vegetal. Tortitas de 30gr de avena y plátano. A media mañana: pieza de fruta"
          },
          {
            "momento": "comida",
            "texto": "Crema de zanahoria. 1 hamburguesa de ternera"
          },
          {
            "momento": "merienda",
            "texto": "125 gramos de kéfir / yogur natural / yogur vegetal / yogur de proteínas + canela / mermelada sin azúcar / cacao desgrasado"
          },
          {
            "momento": "cena",
            "texto": "Ensalada de repollo y manzana. Tortilla de 2 huevos con 1 lata de atún al natural"
          }
        ]
      },
      {
        "dia": "miércoles",
        "comidas": [
          {
            "momento": "desayuno",
            "texto": "Café con bebida vegetal. Tortitas de 30gr de avena y plátano. A media mañana: pieza de fruta"
          },
          {
            "momento": "comida",
            "texto": "Ensalada de 50-60gr pasta de lentejas (seco) y queso de cabra + lata de atún, o ensalada de 120-150gr de alubias (en conserva) con atún"
          },
          {
            "momento": "merienda",
            "texto": "125 gramos de kéfir / yogur natural / yogur vegetal / yogur de proteínas + canela / mermelada sin azúcar / cacao desgrasado"
          },
          {
            "momento": "cena",
            "texto": "Espinacas rehogadas con pimentón. 1-2 brochetas de pavo / pollo"
          }
        ]
      },
      {
        "dia": "jueves",
        "comidas": [
          {
            "momento": "desayuno",
            "texto": "Café con bebida vegetal. 125gr de yogur con fruta y 30gr de cereal. A media mañana: pieza de fruta"
          },
          {
            "momento": "comida",
            "texto": "Salmón a la plancha con judías verdes salteadas con ajos"
          },
          {
            "momento": "merienda",
            "texto": "125 gramos de kéfir / yogur natural / yogur vegetal / yogur de proteínas + canela / mermelada sin azúcar / cacao desgrasado"
          },
          {
            "momento": "cena",
            "texto": "Taza de sopa de pollo. Sartenada de champiñón con 2 huevos y 2 claras"
          }
        ]
      },
      {
        "dia": "viernes",
        "comidas": [
          {
            "momento": "desayuno",
            "texto": "Café con bebida vegetal. 125gr de yogur con fruta y 30gr de cereal. A media mañana: pieza de fruta"
          },
          {
            "momento": "comida",
            "texto": "Sepia a la plancha con verduras (pimiento, calabacín, berenjena, tomate). Boniato pequeño asado"
          },
          {
            "momento": "merienda",
            "texto": "125 gramos de kéfir / yogur natural / yogur vegetal / yogur de proteínas + canela / mermelada sin azúcar / cacao desgrasado"
          },
          {
            "momento": "cena",
            "texto": "Ensalada mixta completa (con huevo duro + 1 lata de atún al natural)"
          }
        ]
      },
      {
        "dia": "sábado",
        "comidas": [
          {
            "momento": "desayuno",
            "texto": "Café con bebida vegetal. 125gr de yogur con fruta y 30gr de cereal. A media mañana: pieza de fruta"
          },
          {
            "momento": "comida",
            "texto": "Calabaza con requesón / burrata / mozzarella. Muslo y contramuslo de pollo asado"
          },
          {
            "momento": "merienda",
            "texto": "125 gramos de kéfir / yogur natural / yogur vegetal / yogur de proteínas + canela / mermelada sin azúcar / cacao desgrasado"
          },
          {
            "momento": "cena",
            "texto": "Merluza con menestra"
          }
        ]
      },
      {
        "dia": "domingo",
        "comidas": [
          {
            "momento": "desayuno",
            "texto": ""
          },
          {
            "momento": "comida",
            "texto": ""
          },
          {
            "momento": "merienda",
            "texto": ""
          },
          {
            "momento": "cena",
            "texto": ""
          }
        ]
      }
    ]
  },
  {
    "numero": 3,
    "nombre": "Menú 3",
    "dias": [
      {
        "dia": "lunes",
        "comidas": [
          {
            "momento": "desayuno",
            "texto": "1 taza de café con leche. 1-2 rebanadas de pan de espelta 100% Mercadona. 4 lonchas de jamón York Aldi. A media mañana: pieza de fruta"
          },
          {
            "momento": "comida",
            "texto": "130gr de garbanzos (en conserva) con judías verdes. 100gr de pechuga de pollo a la plancha"
          },
          {
            "momento": "merienda",
            "texto": "125 gramos de kéfir con canela"
          },
          {
            "momento": "cena",
            "texto": "2 huevos revueltos con atún y espárragos trigueros (puedes añadir 2 claras)"
          }
        ]
      },
      {
        "dia": "martes",
        "comidas": [
          {
            "momento": "desayuno",
            "texto": "1 taza de café con leche. Tortitas de 30gr de avena y plátano. A media mañana: pieza de fruta"
          },
          {
            "momento": "comida",
            "texto": "150gr de merluza con pisto y cous-cous (120gr hervido)"
          },
          {
            "momento": "merienda",
            "texto": "125 gramos de kéfir con canela"
          },
          {
            "momento": "cena",
            "texto": "1 taza de gazpacho. 2 piezas de muslo - contramuslo deshuesado de pollo"
          }
        ]
      },
      {
        "dia": "miércoles",
        "comidas": [
          {
            "momento": "desayuno",
            "texto": "1 taza de café con leche. 1-2 rebanadas de pan de espelta 100% Mercadona. 1 ración individual de queso fresco de cabra. A media mañana: pieza de fruta"
          },
          {
            "momento": "comida",
            "texto": "Ensalada de 150gr de lentejas y mostaza. Filete o hamburguesa de ternera"
          },
          {
            "momento": "merienda",
            "texto": "125 gramos de kéfir con canela"
          },
          {
            "momento": "cena",
            "texto": "Berenjena asada. 150gr de bonito / 120gr de sardina o boquerón a la plancha o asado (puede ser cualquier pescado azul)"
          }
        ]
      },
      {
        "dia": "jueves",
        "comidas": [
          {
            "momento": "desayuno",
            "texto": "1 taza de café con leche. Tortitas de 30gr de avena y plátano. A media mañana: pieza de fruta"
          },
          {
            "momento": "comida",
            "texto": "100gr de pollo con champiñones, zanahoria y arroz (125gr)"
          },
          {
            "momento": "merienda",
            "texto": "125 gramos de kéfir con canela"
          },
          {
            "momento": "cena",
            "texto": "Revuelto de 2 huevos con acelgas y jamón serrano"
          }
        ]
      },
      {
        "dia": "viernes",
        "comidas": [
          {
            "momento": "desayuno",
            "texto": "1 taza de café con leche. 1-2 rebanadas de pan de espelta 100% Mercadona. 30 gramos de salmón ahumado. A media mañana: pieza de fruta"
          },
          {
            "momento": "comida",
            "texto": "Ensalada campera (máx 180gr de patata)"
          },
          {
            "momento": "merienda",
            "texto": "125 gramos de kéfir con canela"
          },
          {
            "momento": "cena",
            "texto": "Ensalada de remolacha y queso de cabra // 1 taza de gazpacho. Dorada asada o a la plancha o 2 huevos rellenos de tomate y atún"
          }
        ]
      },
      {
        "dia": "sábado",
        "comidas": [
          {
            "momento": "desayuno",
            "texto": "1 taza de café con leche. Tortitas de 30gr de avena y plátano. A media mañana: pieza de fruta"
          },
          {
            "momento": "comida",
            "texto": "Espaguetis de calabacín con berenjena, champiñones y carne picada (120gr)"
          },
          {
            "momento": "merienda",
            "texto": "125 gramos de kéfir con canela"
          },
          {
            "momento": "cena",
            "texto": "Bacalao al papillote con verduras asadas"
          }
        ]
      },
      {
        "dia": "domingo",
        "comidas": [
          {
            "momento": "desayuno",
            "texto": ""
          },
          {
            "momento": "comida",
            "texto": ""
          },
          {
            "momento": "merienda",
            "texto": ""
          },
          {
            "momento": "cena",
            "texto": ""
          }
        ]
      }
    ]
  },
  {
    "numero": 4,
    "nombre": "Menú 4",
    "dias": [
      {
        "dia": "lunes",
        "comidas": [
          {
            "momento": "desayuno",
            "texto": "1 taza de café con bebida vegetal o semidesnatada / infusión. 125gr de yogur natural con pieza de fruta y 30gr de cereal sin azúcar. A media mañana: pieza de fruta y 15 gramos de frutos secos"
          },
          {
            "momento": "comida",
            "texto": "Ensalada de repollo y zanahoria. 130gr de pechuga de pollo a la plancha marinado. 1 unidad mediana de patata, hervida"
          },
          {
            "momento": "merienda",
            "texto": "1 yogur líquido de proteínas / yogur natural / yogur vegetal ALPRO"
          },
          {
            "momento": "cena",
            "texto": "(Consomera o plato hondo) de crema de calabaza. Tortilla a la francesa de 2 huevos con jamón de york"
          }
        ]
      },
      {
        "dia": "martes",
        "comidas": [
          {
            "momento": "desayuno",
            "texto": "1 taza de café con bebida vegetal o semidesnatada / infusión. Gachas de 30-40gr de avena y arándanos. A media mañana: pieza de fruta y 15 gramos de frutos secos"
          },
          {
            "momento": "comida",
            "texto": "150gr de merluza al papillote con verduras. 100 gramos de ñoquis salteados"
          },
          {
            "momento": "merienda",
            "texto": "1 yogur líquido de proteínas / yogur natural / yogur vegetal ALPRO"
          },
          {
            "momento": "cena",
            "texto": "Berenjena asada / a la plancha. Sepia a la plancha"
          }
        ]
      },
      {
        "dia": "miércoles",
        "comidas": [
          {
            "momento": "desayuno",
            "texto": "1 taza de café con bebida vegetal o semidesnatada / infusión. Tortitas de avena y plátano. A media mañana: pieza de fruta y 15 gramos de frutos secos"
          },
          {
            "momento": "comida",
            "texto": "Brócoli y champiñón en salsa de soja. 130gr de pechuga de pollo a la plancha / 2 piezas contramuslo deshuesado a la plancha / muslo de pollo asado. Medio boniato asado"
          },
          {
            "momento": "merienda",
            "texto": "1 yogur líquido de proteínas / yogur natural / yogur vegetal ALPRO"
          },
          {
            "momento": "cena",
            "texto": "Ensalada mixta completa (huevo duro + lata de atún al natural)"
          }
        ]
      },
      {
        "dia": "jueves",
        "comidas": [
          {
            "momento": "desayuno",
            "texto": "1 taza de café con bebida vegetal o semidesnatada / infusión. 125gr de yogur natural con pieza de fruta y 30gr de cereal sin azúcar. A media mañana: pieza de fruta y 15 gramos de frutos secos"
          },
          {
            "momento": "comida",
            "texto": "150gr de bacalao al papillote con verduras. 100-125 gramos de arroz blanco cocido"
          },
          {
            "momento": "merienda",
            "texto": "1 yogur líquido de proteínas / yogur natural / yogur vegetal ALPRO"
          },
          {
            "momento": "cena",
            "texto": "1 taza de consomé de pollo. Tortilla de 2 huevos con verduras"
          }
        ]
      },
      {
        "dia": "viernes",
        "comidas": [
          {
            "momento": "desayuno",
            "texto": "1 taza de café con bebida vegetal o semidesnatada / infusión. Gachas de 30-40gr de avena al microondas con fruta. A media mañana: pieza de fruta y 15 gramos de frutos secos"
          },
          {
            "momento": "comida",
            "texto": "Ensalada mixta. 60-70gr de pasta (en seco) a la boloñesa"
          },
          {
            "momento": "merienda",
            "texto": "1 yogur líquido de proteínas / yogur natural / yogur vegetal ALPRO"
          },
          {
            "momento": "cena",
            "texto": "Escalivada de verduras. 120gr de solomillos de pavo a la plancha"
          }
        ]
      },
      {
        "dia": "sábado",
        "comidas": [
          {
            "momento": "desayuno",
            "texto": "1 taza de café con bebida vegetal o semidesnatada / infusión. 1-2 rebanadas de pan de espelta 100% Mercadona. Aceite y sal. Nota: puedes hacer una tortilla francesa o añadir medio aguacate. A media mañana: pieza de fruta y 15 gramos de frutos secos"
          },
          {
            "momento": "comida",
            "texto": "Espinacas con 150gr de garbanzos (en conserva). Boquerones con ajo y perejil y rodajas de tomate al horno"
          },
          {
            "momento": "merienda",
            "texto": "1 yogur líquido de proteínas / yogur natural / yogur vegetal ALPRO"
          },
          {
            "momento": "cena",
            "texto": "Puerros asados en airfryer u horno. Brochetas de pollo"
          }
        ]
      },
      {
        "dia": "domingo",
        "comidas": [
          {
            "momento": "desayuno",
            "texto": ""
          },
          {
            "momento": "comida",
            "texto": ""
          },
          {
            "momento": "merienda",
            "texto": ""
          },
          {
            "momento": "cena",
            "texto": ""
          }
        ]
      }
    ]
  }
];
