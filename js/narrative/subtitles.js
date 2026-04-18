// js/narrative/subtitles.js
export const SUBTITLES = {
  prologue: [
    "Honduras tiene potencial petrolero tanto en el mar Caribe como en tierra: Mosquitia, Valle de Sula, Golfo de Fonseca.",
    "El problema: no podemos ver el subsuelo directamente. Solo podemos perforar en un punto y medir qué tan prometedor es.",
    "Tres estrategias de exploración van a intentar localizar el yacimiento óptimo.",
  ],
  act1: {
    title: "Evolution Strategies (ES)",
    s11: [
      "El equipo perfora pozos en ubicaciones aleatorias del campo.",
      "Cada campaña: se conservan los mejores μ pozos y se perforan λ nuevos cerca de ellos.",
      "σ controla el desplazamiento: qué tan lejos del pozo padre se perfora el hijo.",
    ],
    s12: [
      "El círculo punteado alrededor del mejor pozo muestra el radio típico σ de la próxima perforación.",
      "σ grande: exploración amplia. σ pequeño: refinamiento de una zona prometedora.",
      "La estrategia no usa información sobre la forma del subsuelo: solo memoria de dónde salió petróleo.",
    ],
    s13: [
      "ES encontró una zona productiva, pero necesitó muchas campañas.",
      "Sin modelo del subsuelo, explora de forma ciega en todas las direcciones.",
      "¿Podríamos aprender la geometría del campo para perforar más inteligentemente?",
    ],
    note: "σ grande: cubre todo el campo. σ pequeño: se queda atrapado en un área local.",
  },
  act2: {
    title: "CMA-ES",
    s21: [
      "CMA-ES aprende la geometría del subsuelo a medida que perfora.",
      "Mantiene una distribución estadística que representa las zonas más prometedoras.",
      "Con cada campaña, actualiza esa distribución para concentrar la perforación.",
    ],
    s22: [
      "Mira la elipse verde: es el mapa geológico aprendido. Su tamaño dice dónde perforar, su orientación dice en qué dirección.",
      "Los pozos con halo tenue son los μ seleccionados; de ellos nace la nueva elipse.",
      "Cuando los mejores se alinean en una dirección, la elipse se estira y rota para seguirla.",
    ],
    s23: [
      "CMA-ES localizó el yacimiento en pocas campañas.",
      "El modelo aprendido del subsuelo concentró la perforación donde más importa.",
      "Costo: O(n²) por campaña — en campos de alta dimensión puede ser lento.",
    ],
  },
  act3: {
    title: "Differential Evolution (DE)",
    s31: [
      "Esta estrategia no construye modelos estadísticos del subsuelo.",
      "Para cada pozo x, selecciona tres pozos existentes: a, b, c.",
      "Propone un nuevo sitio: v = a + F × (b − c). Si mejora x, lo reemplaza.",
    ],
    s32: [
      "Los tres pozos coloreados son a (base, azul), b y c (rosados). La flecha roja b−c es la diferencia entre hermanas.",
      "La flecha naranja suma esa diferencia escalada por F al pozo a: el candidato propuesto.",
      "CR decide cuántas coordenadas del candidato se heredan. La diversidad del portafolio es la fuente de información.",
    ],
    s33: [
      "La exploración diferencial converge usando diferencias entre pozos como guía.",
      "Sin modelos estadísticos: solo aritmética vectorial entre ubicaciones.",
      "Robusto y efectivo en subsuelos con múltiples zonas prometedoras falsas.",
    ],
  },
  epilogue: [
    "Tres estrategias. Un mismo yacimiento.",
    "ES: desplazamiento aleatorio. Simple, pero necesita muchas campañas.",
    "CMA-ES: aprende la geometría del subsuelo. Pocas campañas, más cómputo por campaña.",
    "DE: usa diferencias entre pozos. Robusto, sin modelos estadísticos.",
    "En Honduras, tanto en aguas del Caribe como en tierra, la elección del método depende del tipo de terreno y los datos disponibles.",
  ],
};
