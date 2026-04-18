// js/narrative/algoInfo.js
// Detalle de ingeniería de cada algoritmo, mostrado en el modal del header.

export const ALGO_INFO = {
  es: {
    title: 'Evolution Strategies — (μ, λ)-ES',
    body: `
      <h4>En términos simples</h4>
      <p>Imagina una empresa petrolera que nunca ha explorado un campo. Perfora <strong>al azar</strong> 30 pozos, conserva los <strong>10 mejores</strong> (los que dieron más petróleo) y en la siguiente campaña vuelve a perforar cerca de ellos, pero no exactamente encima: un poco hacia los lados, a una distancia típica <strong>σ</strong>. Si σ es grande, apuesta lejos; si es chico, refina. No tiene mapa geológico ni teoría — solo memoria de dónde salió petróleo antes. Es la estrategia más honesta y más ciega.</p>

      <h4>Propósito del punto amarillo</h4>
      <p>Es una <strong>etiqueta, no una identidad</strong>: marca al individuo con menor fitness de la generación actual. En modo <code>(μ,λ)</code> la población se reemplaza entera cada paso, así que el "mejor" salta de un hijo a otro — por eso el punto amarillo se mueve y a veces incluso empeora. En <code>(μ+λ)</code> padres e hijos compiten juntos y el mejor nunca retrocede.</p>

      <h4>Idea central</h4>
      <p>Búsqueda evolutiva de caja negra basada en <strong>mutación gaussiana</strong> y selección truncada. No usa gradientes ni modelos del paisaje. Toda la información proviene del fitness comparativo entre individuos.</p>

      <h4>Pseudocódigo</h4>
      <pre>inicializar μ padres ~ U(dominio)
para t = 1 .. T:
  por cada padre p, generar λ/μ hijos:
    h = p + σ · N(0, I)
  evaluar f(h) para todos los hijos
  selección (μ, λ): los μ mejores hijos
  selección (μ + λ): los μ mejores de padres ∪ hijos</pre>

      <h4>Hiperparámetros</h4>
      <ul>
        <li><code>μ</code> — padres conservados (5–20). Ratio típica μ/λ ≈ 1/3.</li>
        <li><code>λ</code> — descendencia por generación (10–40).</li>
        <li><code>σ</code> — desviación estándar de la mutación. Determina el balance exploración/explotación.</li>
      </ul>

      <h4>Variantes (μ,λ) vs (μ+λ)</h4>
      <p><strong>(μ,λ)</strong> reemplaza padres por hijos cada generación: olvido total, evita estancamiento. <strong>(μ+λ)</strong> conserva los mejores entre ambos: elitista, converge más rápido pero puede atascarse en óptimos locales.</p>

      <h4>Adaptación de σ</h4>
      <p>Esta implementación usa σ <em>fija</em> (control manual). En la práctica se usa la <strong>regla 1/5</strong> de Rechenberg: si más de 1/5 de las mutaciones mejoran, aumentar σ; si menos, reducirla.</p>

      <h4>Complejidad</h4>
      <p>Por generación: <code>O(λ · d)</code> evaluaciones, donde d es la dimensión. Sin overhead matricial — extremadamente barato comparado con CMA-ES.</p>

      <h4>Trade-offs</h4>
      <ul>
        <li>+ Simple, rápido por generación, pocos hiperparámetros.</li>
        <li>+ Excelente baseline para problemas separables.</li>
        <li>− No aprende correlaciones entre dimensiones.</li>
        <li>− Sensible a la escala de σ; mal valor → exploración ciega o estancamiento.</li>
      </ul>
    `,
  },

  cmaes: {
    title: 'CMA-ES — Covariance Matrix Adaptation',
    body: `
      <h4>En términos simples</h4>
      <p>La misma empresa, pero ahora con un geólogo. Cada campaña no solo conserva los mejores pozos: <strong>aprende la forma del yacimiento</strong>. Si los buenos pozos tienden a alinearse en diagonal norte-sureste, la próxima ronda perforará siguiendo esa diagonal. La <strong>elipse verde</strong> es ese "mapa geológico aprendido": su tamaño indica cuánta área cubre la próxima campaña, y su orientación indica la dirección favorecida. La elipse nace circular (sin conocimiento) y con cada campaña se estira y rota hacia donde están las mejores apuestas.</p>

      <h4>Propósito del punto amarillo</h4>
      <p>Marca al mejor individuo de la camada actual, pero lo importante aquí es la <strong>elipse verde</strong>: ella es la "memoria" del algoritmo. El punto amarillo se mueve porque cada generación se muestrea una nueva nube desde <code>N(m, σ²·C)</code>; la elipse, en cambio, se alarga y rota hacia las direcciones donde los mejores hijos aparecieron, aprendiendo la forma del valle.</p>

      <h4>Idea central</h4>
      <p>Mantener una distribución gaussiana multivariada <code>N(m, σ²·C)</code> sobre el espacio de búsqueda y <strong>aprender su forma</strong> a partir de los pasos exitosos. La matriz <code>C</code> codifica la geometría local del paisaje (correlaciones entre variables).</p>

      <h4>Pseudocódigo (rank-1)</h4>
      <pre>m, σ, C ← inicialización
p_c ← 0   // camino evolutivo
para t = 1 .. T:
  muestrear λ hijos: x_i = m + σ · B·D·z_i, z_i ~ N(0, I)
  evaluar y ordenar: x_{1:λ} ≤ ... ≤ x_{λ:λ}
  selección: y = Σ w_i · (x_{i:λ} − m) / σ   (con i = 1..μ)
  m ← m + σ · y
  p_c ← (1 − c_c)·p_c + √(c_c(2−c_c)·μ_eff) · y
  C ← (1 − c_1)·C + c_1 · p_c·p_cᵀ
  σ ← σ · exp((‖p_σ‖ / E‖N(0,I)‖ − 1) · c_σ/d_σ)</pre>

      <h4>Componentes clave</h4>
      <ul>
        <li><strong>Rank-1 update</strong>: la implementación de esta experiencia. <code>C</code> se actualiza con el producto exterior del camino evolutivo <code>p_c</code> — barato y suficiente para 2D.</li>
        <li><strong>Cumulative Step-size Adaptation (CSA)</strong>: σ se controla por la longitud del camino acumulado.</li>
        <li><strong>Rank-μ update</strong> (no implementado): incorpora información de los μ mejores simultáneamente. Necesario en alta dimensión.</li>
      </ul>

      <h4>Propiedad notable</h4>
      <p>CMA-ES es <strong>invariante a transformaciones lineales del espacio</strong>: rotaciones, escalados y traslaciones del problema no afectan su trayectoria. Esto lo hace robusto sin necesidad de pre-procesamiento.</p>

      <h4>Complejidad</h4>
      <p>Por generación: <code>O(d²)</code> por la actualización + descomposición de <code>C</code>. Para d &gt; 100 se usa rank-μ con limitación de memoria (LM-CMA, sep-CMA).</p>

      <h4>Trade-offs</h4>
      <ul>
        <li>+ Estado del arte en optimización continua de caja negra.</li>
        <li>+ Pocos parámetros que el usuario deba ajustar.</li>
        <li>− Costo cuadrático en dimensión.</li>
        <li>− Implementación más compleja; numéricamente sensible.</li>
      </ul>
    `,
  },

  de: {
    title: 'Differential Evolution — DE/rand/1/bin',
    body: `
      <h4>En términos simples</h4>
      <p>Sin modelos ni geólogos. La empresa mantiene un <strong>portafolio fijo</strong> de 30 pozos y, para decidir el próximo intento, escoge tres pozos existentes: <strong>a, b, c</strong>. Toma la <strong>diferencia entre b y c</strong> (un vector que indica "esta es una dirección típica de variación del campo"), la escala por <strong>F</strong>, y la suma al pozo <strong>a</strong>. El resultado es un candidato nuevo. Si mejora al pozo original, lo reemplaza; si no, se descarta. La idea central: <em>la geometría del problema ya está implícita en las diferencias entre pozos existentes</em>. No hace falta aprender nada — solo combinar lo que ya tienes.</p>

      <h4>Propósito del punto amarillo</h4>
      <p>Marca al mejor individuo vivo del portafolio. A diferencia de ES, en DE la selección es <strong>1-vs-1</strong>: cada hijo solo reemplaza a su padre si lo mejora, así que el mejor <strong>nunca retrocede</strong>. El punto amarillo salta únicamente cuando algún individuo supera al campeón anterior; el resto del tiempo permanece fijo mientras las flechas rojas muestran cómo las diferencias entre hermanas proponen nuevos candidatos.</p>

      <h4>Idea central</h4>
      <p>Generar candidatos combinando <strong>diferencias entre individuos existentes</strong> de la población. La diversidad del portafolio es la fuente de información de búsqueda — sin gradientes, sin distribuciones aprendidas, solo aritmética vectorial.</p>

      <h4>Pseudocódigo</h4>
      <pre>inicializar NP individuos ~ U(dominio)
para t = 1 .. T:
  por cada individuo x_i:
    elegir a, b, c ∈ población, distintos de i
    mutación:    v = a + F · (b − c)
    crossover:   por cada coordenada j,
                   u_j = v_j  si rand() ≤ CR  ó  j = j_rand
                   u_j = x_ij  en otro caso
    selección:   x_i ← u  si f(u) ≤ f(x_i)</pre>

      <h4>Hiperparámetros</h4>
      <ul>
        <li><code>NP</code> — tamaño del portafolio (10–40, típicamente 10·d).</li>
        <li><code>F</code> — factor de escala diferencial (0.4–1.0). Valores altos → más exploración.</li>
        <li><code>CR</code> — tasa de crossover (0.1–1.0). Alto para problemas separables; bajo para no-separables con dependencias entre variables.</li>
      </ul>

      <h4>Variantes nominales</h4>
      <p>El esquema <code>DE/rand/1/bin</code> indica:</p>
      <ul>
        <li><strong>rand</strong>: el vector base <code>a</code> es aleatorio (vs <code>best</code>: el mejor actual).</li>
        <li><strong>1</strong>: una sola diferencia <code>(b − c)</code>.</li>
        <li><strong>bin</strong>: crossover binomial (vs <code>exp</code>: exponencial, contiguo).</li>
      </ul>

      <h4>Selección 1-vs-1</h4>
      <p>Cada hijo solo compite con su padre directo. Esto preserva diversidad mucho mejor que la selección global (μ,λ) y es la razón de la robustez de DE en paisajes multimodales.</p>

      <h4>Complejidad</h4>
      <p>Por generación: <code>O(NP · d)</code>. Trivialmente paralelizable: cada candidato es independiente.</p>

      <h4>Trade-offs</h4>
      <ul>
        <li>+ Pocos hiperparámetros, intuitivos.</li>
        <li>+ Robusto en problemas multimodales con varios óptimos falsos.</li>
        <li>+ Paralelización embarazosamente fácil.</li>
        <li>− Convergencia más lenta que CMA-ES en problemas suaves y unimodales.</li>
        <li>− Sin aprendizaje de geometría: no aprovecha estructura del paisaje.</li>
      </ul>
    `,
  },
};
