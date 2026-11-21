// Zoyverse curriculum map, Grades 1-12, aligned with the Cambridge International curriculum
// (Primary = Grades 1-6, Lower Secondary = 7-9, IGCSE = 10-11, A Level = 12).
// Arabic is taught as a first language, French as a foreign language from beginner level.
// DRAFT FOR TEACHER REVIEW: unit titles are written in our own words; teachers should check the order and grade of each unit.
//
// Each unit: "English title|Arabic title|French title", followed by the games that practise it ("subject:gameId", see shared/games-index.js).
(function () {
  const U = (titles, ...games) => { const [en, ar, fr] = titles.split("|"); return { t: { en, ar, fr }, games }; };

  const SUBJECTS = {
    math: { name: { en: "Math", ar: "الرياضيات", fr: "Mathématiques" }, color: "#ffb547", icon: "∑" },
    science: { name: { en: "Science", ar: "العلوم", fr: "Sciences" }, color: "#39d0ff", icon: "⚗" },
    biology: { name: { en: "Biology", ar: "الأحياء", fr: "Biologie" }, color: "#ff5c9a", icon: "🧬" },
    chemistry: { name: { en: "Chemistry", ar: "الكيمياء", fr: "Chimie" }, color: "#b8f03a", icon: "⚗" },
    physics: { name: { en: "Physics", ar: "الفيزياء", fr: "Physique" }, color: "#4d8dff", icon: "⚛" },
    english: { name: { en: "English", ar: "اللغة الإنجليزية", fr: "Anglais" }, color: "#ff7a59", icon: "Aa" },
    arabic: { name: { en: "Arabic", ar: "اللغة العربية", fr: "Arabe" }, color: "#3ddc97", icon: "ض" },
    french: { name: { en: "French", ar: "اللغة الفرنسية", fr: "Français" }, color: "#c084fc", icon: "Fr" },
    geography: { name: { en: "World Geography", ar: "جغرافيا العالم", fr: "Géographie du monde" }, color: "#2ee6c5", icon: "🌍" },
  };
  const STAGES = [
    { grades: [1, 2, 3, 4, 5, 6], name: { en: "Primary", ar: "المرحلة الابتدائية", fr: "Primaire" } },
    { grades: [7, 8, 9], name: { en: "Lower Secondary", ar: "المرحلة المتوسطة", fr: "Collège" } },
    { grades: [10, 11], name: { en: "IGCSE", ar: "IGCSE", fr: "IGCSE" } },
    { grades: [12], name: { en: "A Level", ar: "A Level", fr: "A Level" } },
  ];

  const G = {};

  // ---------------------------------------------------------------- MATH
  G[1] = { math: [
    U("Counting and numbers to 20|العدّ والأعداد حتى 20|Compter et les nombres jusqu'à 20", "math:number-line"),
    U("Tens and ones: numbers to 100|الآحاد والعشرات: الأعداد حتى 100|Dizaines et unités : les nombres jusqu'à 100"),
    U("Adding and subtracting within 20|الجمع والطرح ضمن 20|Additionner et soustraire jusqu'à 20"),
    U("Halves and sharing|الأنصاف والتقسيم بالتساوي|Les moitiés et le partage", "math:fractions"),
    U("Patterns and sequences|الأنماط والمتتاليات|Motifs et suites", "math:sequences"),
    U("2D and 3D shapes|الأشكال ثنائية وثلاثية الأبعاد|Formes en 2D et en 3D"),
    U("Comparing length, mass and capacity|مقارنة الطول والكتلة والسعة|Comparer longueurs, masses et contenances"),
    U("Days, months and o'clock times|الأيام والأشهر والساعة تمامًا|Jours, mois et heures pile"),
    U("Sorting and simple charts|التصنيف والمخططات البسيطة|Trier et tableaux simples"),
  ] };
  G[2] = { math: [
    U("Numbers to 100 and place value|الأعداد حتى 100 والقيمة المكانية|Les nombres jusqu'à 100 et la valeur de position", "math:number-line"),
    U("Adding and subtracting to 100|الجمع والطرح حتى 100|Additionner et soustraire jusqu'à 100"),
    U("Multiplying as groups: 2, 5 and 10|الضرب كمجموعات: 2 و5 و10|Multiplier par groupes : 2, 5 et 10", "math:times-tables"),
    U("Halves and quarters|الأنصاف والأرباع|Moitiés et quarts", "math:fractions"),
    U("Number patterns|أنماط الأعداد|Suites de nombres", "math:sequences"),
    U("Shapes and symmetry|الأشكال والتماثل|Formes et symétrie"),
    U("Measuring in cm, kg and litres|القياس بالسنتيمتر والكيلوغرام واللتر|Mesurer en cm, kg et litres"),
    U("Telling time to the quarter hour|قراءة الساعة حتى الربع|Lire l'heure au quart d'heure"),
    U("Pictograms and block graphs|المخططات بالصور والأعمدة|Pictogrammes et diagrammes en blocs"),
  ] };
  G[3] = { math: [
    U("Numbers to 1000|الأعداد حتى 1000|Les nombres jusqu'à 1000", "math:number-line"),
    U("Mental addition and subtraction|الجمع والطرح الذهني|Calcul mental : addition et soustraction"),
    U("Times tables 3, 4, 6 and 8|جداول الضرب 3 و4 و6 و8|Tables de 3, 4, 6 et 8", "math:times-tables"),
    U("Division and remainders|القسمة والباقي|La division et le reste"),
    U("Fractions of shapes and numbers|كسور الأشكال والأعداد|Fractions de formes et de nombres", "math:fractions"),
    U("Perimeter|المحيط|Le périmètre", "math:area-perimeter"),
    U("Right angles and turns|الزوايا القائمة والدوران|Angles droits et rotations", "math:angles"),
    U("Time and clocks|الوقت والساعات|L'heure et les horloges"),
    U("Bar charts, Venn and Carroll diagrams|المخططات الشريطية ومخططات فن وكارول|Diagrammes en barres, de Venn et de Carroll"),
  ] };
  G[4] = { math: [
    U("Numbers to 10 000 and negative numbers|الأعداد حتى 10000 والأعداد السالبة|Les nombres jusqu'à 10 000 et les nombres négatifs", "math:number-line"),
    U("Times tables to 10 × 10|جداول الضرب حتى 10 × 10|Les tables jusqu'à 10 × 10", "math:times-tables"),
    U("Written multiplication and division|الضرب والقسمة الكتابيان|Multiplication et division posées"),
    U("Equivalent fractions|الكسور المتكافئة|Fractions équivalentes", "math:fractions"),
    U("Decimals: tenths and hundredths|الكسور العشرية: الأعشار والأجزاء من مئة|Les décimaux : dixièmes et centièmes"),
    U("Area and perimeter|المساحة والمحيط|Aire et périmètre", "math:area-perimeter"),
    U("Acute and obtuse angles|الزوايا الحادة والمنفرجة|Angles aigus et obtus", "math:angles"),
    U("Coordinates|الإحداثيات|Les coordonnées", "math:coordinates"),
    U("Frequency tables and the language of chance|جداول التكرار ولغة الاحتمال|Tableaux d'effectifs et vocabulaire du hasard"),
  ] };
  G[5] = { math: [
    U("Large numbers and rounding|الأعداد الكبيرة والتقريب|Grands nombres et arrondis"),
    U("Negative numbers|الأعداد السالبة|Les nombres négatifs", "math:number-line"),
    U("Factors, multiples and prime numbers|العوامل والمضاعفات والأعداد الأولية|Diviseurs, multiples et nombres premiers", "math:primes"),
    U("Fractions, decimals and percentages|الكسور والكسور العشرية والنسب المئوية|Fractions, décimaux et pourcentages", "math:percentages", "math:fractions"),
    U("Multiplying and dividing larger numbers|ضرب وقسمة الأعداد الكبيرة|Multiplier et diviser de grands nombres", "math:times-tables"),
    U("Angles in triangles|زوايا المثلث|Les angles du triangle", "math:angles"),
    U("Area of rectangles and compound shapes|مساحة المستطيلات والأشكال المركّبة|Aire des rectangles et des figures composées", "math:area-perimeter"),
    U("Coordinates and translations|الإحداثيات والانسحاب|Coordonnées et translations", "math:coordinates"),
    U("Number sequences|المتتاليات العددية|Suites numériques", "math:sequences"),
    U("Line graphs and probability|الرسوم البيانية الخطية والاحتمال|Graphiques linéaires et probabilités"),
  ] };
  G[6] = { math: [
    U("Place value to millions|القيمة المكانية حتى الملايين|La valeur de position jusqu'aux millions"),
    U("Primes, squares and cubes|الأعداد الأولية والمربعات والمكعبات|Nombres premiers, carrés et cubes", "math:primes"),
    U("Order of operations|ترتيب العمليات|L'ordre des opérations"),
    U("Fractions, decimals, percentages and ratio|الكسور والنسب المئوية والنسبة|Fractions, pourcentages et ratios", "math:percentages", "math:fractions"),
    U("Simple algebra and formulae|الجبر البسيط والصيغ|Algèbre simple et formules", "math:balance-scale"),
    U("Angles in polygons and circles|الزوايا في المضلعات والدائرة|Angles des polygones et du cercle", "math:angles"),
    U("Area and volume|المساحة والحجم|Aire et volume", "math:area-perimeter"),
    U("Coordinates in four quadrants and reflections|الإحداثيات في الأرباع الأربعة والانعكاس|Coordonnées dans les quatre quadrants et symétries", "math:coordinates"),
    U("Mean, median, mode and range|المتوسط والوسيط والمنوال والمدى|Moyenne, médiane, mode et étendue"),
    U("Probability|الاحتمال|Les probabilités"),
  ] };
  G[7] = { math: [
    U("Integers, powers and roots|الأعداد الصحيحة والقوى والجذور|Entiers, puissances et racines", "math:primes", "math:number-line"),
    U("Expressions and equations|العبارات والمعادلات|Expressions et équations", "math:balance-scale"),
    U("Sequences and functions|المتتاليات والدوال|Suites et fonctions", "math:sequences"),
    U("Fractions, decimals and percentages|الكسور والكسور العشرية والنسب المئوية|Fractions, décimaux et pourcentages", "math:percentages"),
    U("Angles and constructions|الزوايا والإنشاءات الهندسية|Angles et constructions", "math:angles"),
    U("Area, perimeter and volume|المساحة والمحيط والحجم|Aire, périmètre et volume", "math:area-perimeter"),
    U("Coordinates and straight-line graphs|الإحداثيات ورسوم الخط المستقيم|Coordonnées et droites", "math:coordinates"),
    U("Statistics and probability|الإحصاء والاحتمال|Statistiques et probabilités"),
  ] };
  G[8] = { math: [
    U("Indices and standard form|الأسس والصيغة العلمية|Puissances et notation scientifique"),
    U("Expanding, factorising and linear equations|فك الأقواس والتحليل والمعادلات الخطية|Développer, factoriser et équations linéaires", "math:balance-scale"),
    U("Linear graphs|الرسوم البيانية الخطية|Fonctions linéaires", "math:coordinates"),
    U("Ratio and proportion|النسبة والتناسب|Ratios et proportionnalité", "math:percentages"),
    U("Percentage change|التغير بالنسبة المئوية|Variation en pourcentage", "math:percentages"),
    U("Circles: circumference and area|الدائرة: المحيط والمساحة|Le cercle : périmètre et aire"),
    U("Transformations|التحويلات الهندسية|Les transformations"),
    U("Statistics and probability|الإحصاء والاحتمال|Statistiques et probabilités"),
  ] };
  G[9] = { math: [
    U("Powers, roots and standard form|القوى والجذور والصيغة العلمية|Puissances, racines et notation scientifique", "math:primes"),
    U("Equations and inequalities|المعادلات والمتباينات|Équations et inéquations", "math:balance-scale"),
    U("Simultaneous equations|المعادلات الآنية|Systèmes d'équations"),
    U("Quadratic expressions|العبارات التربيعية|Expressions du second degré"),
    U("Sequences: the nth term|المتتاليات: الحد النوني|Suites : le terme de rang n", "math:sequences"),
    U("Pythagoras' theorem|نظرية فيثاغورس|Le théorème de Pythagore"),
    U("Compound percentages and interest|النسب المئوية المركّبة والفائدة|Pourcentages composés et intérêts", "math:percentages"),
    U("Volume and surface area|الحجم والمساحة السطحية|Volume et aire latérale"),
    U("Probability and statistics|الاحتمال والإحصاء|Probabilités et statistiques"),
  ] };
  G[10] = { math: [
    U("Types of number, HCF and LCM|أنواع الأعداد والقاسم المشترك الأكبر والمضاعف المشترك الأصغر|Types de nombres, PGCD et PPCM", "math:primes"),
    U("Linear and quadratic equations|المعادلات الخطية والتربيعية|Équations linéaires et du second degré", "math:balance-scale"),
    U("Graphs of functions|التمثيل البياني للدوال|Représentations graphiques de fonctions", "math:coordinates"),
    U("Angle properties and circle theorems|خصائص الزوايا ونظريات الدائرة|Propriétés des angles et théorèmes du cercle", "math:angles"),
    U("Mensuration: perimeter, area and volume|القياس: المحيط والمساحة والحجم|Mesures : périmètre, aire et volume", "math:area-perimeter"),
    U("Trigonometry|حساب المثلثات|Trigonométrie"),
    U("Vectors and transformations|المتجهات والتحويلات|Vecteurs et transformations"),
    U("Probability|الاحتمال|Probabilités"),
    U("Statistics|الإحصاء|Statistiques"),
  ] };
  G[11] = { math: [
    U("Functions and inverse functions|الدوال والدوال العكسية|Fonctions et fonctions réciproques"),
    U("Quadratic and cubic graphs|الرسوم التربيعية والتكعيبية|Courbes du second et du troisième degré", "math:coordinates"),
    U("Sequences and series|المتتاليات والمتسلسلات|Suites et séries", "math:sequences"),
    U("Direct and inverse variation|التغير الطردي والعكسي|Proportionnalité directe et inverse"),
    U("Sine rule, cosine rule and 3D trigonometry|قانون الجيوب وجيوب التمام والمثلثات في الفضاء|Loi des sinus, loi des cosinus et trigonométrie dans l'espace"),
    U("Introduction to differentiation|مقدمة في الاشتقاق|Introduction à la dérivation"),
    U("Cumulative frequency and histograms|التكرار التراكمي والمدرجات التكرارية|Effectifs cumulés et histogrammes"),
    U("Percentages and money problems|النسب المئوية والمسائل المالية|Pourcentages et problèmes financiers", "math:percentages"),
  ] };
  G[12] = { math: [
    U("Quadratics|الدوال التربيعية|Le second degré"),
    U("Functions|الدوال|Les fonctions"),
    U("Coordinate geometry|الهندسة التحليلية|Géométrie analytique", "math:coordinates"),
    U("Circular measure (radians)|القياس الدائري (الراديان)|Mesure en radians"),
    U("Trigonometry|حساب المثلثات|Trigonométrie"),
    U("Series: arithmetic, geometric and binomial|المتسلسلات: الحسابية والهندسية وذات الحدين|Suites arithmétiques, géométriques et binôme", "math:sequences"),
    U("Differentiation|الاشتقاق|La dérivation"),
    U("Integration|التكامل|L'intégration"),
    U("Mechanics: forces and motion|الميكانيكا: القوى والحركة|Mécanique : forces et mouvement", "physics:force-motion", "physics:projectile"),
    U("Probability and statistics|الاحتمال والإحصاء|Probabilités et statistiques"),
  ] };

  // ---------------------------------------------------------------- SCIENCE (Grades 1-9), then Biology / Chemistry / Physics (10-12)
  G[1].science = [
    U("Living and non-living things|الكائنات الحية وغير الحية|Le vivant et le non-vivant"),
    U("Animals around us|الحيوانات من حولنا|Les animaux autour de nous", "biology:animal-classes"),
    U("Parts of a plant|أجزاء النبات|Les parties d'une plante"),
    U("My body and my senses|جسمي وحواسي|Mon corps et mes sens", "biology:body-organs"),
    U("Materials and their properties|المواد وخصائصها|Les matériaux et leurs propriétés"),
    U("Pushes and pulls|الدفع والسحب|Pousser et tirer", "physics:force-motion"),
    U("Sounds around us|الأصوات من حولنا|Les sons autour de nous", "physics:sound-waves"),
    U("Day, night and the Sun|الليل والنهار والشمس|Le jour, la nuit et le Soleil"),
  ];
  G[2].science = [
    U("Habitats|البيئات الطبيعية|Les habitats"),
    U("Growing up: life cycles|النمو: دورات الحياة|Grandir : les cycles de vie", "biology:life-cycles"),
    U("Healthy bodies and the skeleton|الجسم السليم والهيكل العظمي|Un corps en bonne santé et le squelette", "biology:skeleton"),
    U("Changing materials|تغيّر المواد|Transformer les matériaux"),
    U("Light and dark|الضوء والظلام|La lumière et l'obscurité", "physics:mirrors"),
    U("Electricity and safety|الكهرباء والسلامة|L'électricité et la sécurité"),
    U("Rocks and soil|الصخور والتربة|Les roches et le sol"),
  ];
  G[3].science = [
    U("What plants need to grow|ما يحتاجه النبات لينمو|Ce dont les plantes ont besoin pour pousser", "biology:photosynthesis"),
    U("Skeleton and muscles|الهيكل العظمي والعضلات|Le squelette et les muscles", "biology:skeleton"),
    U("Grouping animals|تصنيف الحيوانات|Classer les animaux", "biology:animal-classes"),
    U("Solids, liquids and gases|المواد الصلبة والسائلة والغازية|Solides, liquides et gaz", "chemistry:states-of-matter"),
    U("Magnets|المغناطيس|Les aimants", "physics:magnets"),
    U("Forces and friction|القوى والاحتكاك|Les forces et le frottement", "physics:force-motion"),
    U("Light and shadows|الضوء والظلال|La lumière et les ombres", "physics:mirrors"),
    U("Rocks and fossils|الصخور والأحافير|Les roches et les fossiles"),
  ];
  G[4].science = [
    U("Food chains and habitats|السلاسل الغذائية والبيئات|Chaînes alimentaires et habitats", "biology:food-chains"),
    U("Organs of the human body|أعضاء جسم الإنسان|Les organes du corps humain", "biology:body-organs"),
    U("Teeth and digestion|الأسنان والهضم|Les dents et la digestion", "biology:digestion"),
    U("Changes of state|تحوّلات حالة المادة|Les changements d'état", "chemistry:states-of-matter"),
    U("Electric circuits|الدوائر الكهربائية|Les circuits électriques", "physics:circuits"),
    U("Sound: vibration and pitch|الصوت: الاهتزاز ودرجة الصوت|Le son : vibrations et hauteur", "physics:sound-waves"),
    U("The Earth moves: day, night and seasons|حركة الأرض: الليل والنهار والفصول|La Terre bouge : jour, nuit et saisons"),
  ];
  G[5].science = [
    U("Plant life cycles and photosynthesis|دورات حياة النبات والبناء الضوئي|Cycle de vie des plantes et photosynthèse", "biology:photosynthesis", "biology:life-cycles"),
    U("The heart and circulation|القلب والدورة الدموية|Le cœur et la circulation", "biology:heart-blood"),
    U("The digestive system|الجهاز الهضمي|L'appareil digestif", "biology:digestion"),
    U("Mixtures and separating them|المخاليط وفصلها|Les mélanges et leur séparation", "chemistry:separation"),
    U("Dissolving|الذوبان|La dissolution"),
    U("Light: reflection|الضوء: الانعكاس|La lumière : la réflexion", "physics:mirrors"),
    U("Gravity and air resistance|الجاذبية ومقاومة الهواء|La gravité et la résistance de l'air", "physics:gravity"),
    U("The Earth, Moon and Solar System|الأرض والقمر والمجموعة الشمسية|La Terre, la Lune et le système solaire"),
  ];
  G[6].science = [
    U("Cells and microorganisms|الخلايا والكائنات الدقيقة|Les cellules et les micro-organismes", "biology:cell-explorer"),
    U("Classifying living things|تصنيف الكائنات الحية|Classer les êtres vivants", "biology:animal-classes"),
    U("Reversible and irreversible changes|التغيرات العكوسة وغير العكوسة|Transformations réversibles et irréversibles", "chemistry:physical-chemical"),
    U("Circuits and circuit symbols|الدوائر ورموزها|Les circuits et leurs symboles", "physics:circuits"),
    U("Floating and sinking|الطفو والغوص|Flotter et couler", "physics:float-sink"),
    U("Energy|الطاقة|L'énergie", "physics:energy-ramp"),
    U("Inside the Earth: plates, volcanoes and earthquakes|باطن الأرض: الصفائح والبراكين والزلازل|L'intérieur de la Terre : plaques, volcans et séismes"),
  ];
  G[7].science = [
    U("Cells and organisms|الخلايا والكائنات الحية|Cellules et organismes", "biology:cell-explorer"),
    U("Classification|التصنيف|La classification", "biology:animal-classes"),
    U("The particle model and states of matter|النموذج الجسيمي وحالات المادة|Le modèle particulaire et les états de la matière", "chemistry:states-of-matter"),
    U("Elements, compounds and mixtures|العناصر والمركبات والمخاليط|Éléments, composés et mélanges", "chemistry:molecule-builder", "chemistry:separation"),
    U("Physical and chemical changes|التغيرات الفيزيائية والكيميائية|Transformations physiques et chimiques", "chemistry:physical-chemical"),
    U("Forces and speed|القوى والسرعة|Forces et vitesse", "physics:force-motion"),
    U("Energy|الطاقة|L'énergie", "physics:energy-ramp"),
    U("Gravity and the Solar System|الجاذبية والمجموعة الشمسية|La gravité et le système solaire", "physics:gravity"),
  ];
  G[8].science = [
    U("Respiration and the lungs|التنفس والرئتان|La respiration et les poumons"),
    U("Nutrition and digestion|التغذية والهضم|La nutrition et la digestion", "biology:digestion"),
    U("The circulatory system|الجهاز الدوري|L'appareil circulatoire", "biology:heart-blood"),
    U("Photosynthesis|البناء الضوئي|La photosynthèse", "biology:photosynthesis"),
    U("Atoms and the periodic table|الذرات والجدول الدوري|Les atomes et le tableau périodique", "chemistry:atom-builder", "chemistry:periodic-table"),
    U("Metals and non-metals|الفلزات واللافلزات|Métaux et non-métaux", "chemistry:metals-nonmetals"),
    U("Acids, alkalis and pH|الأحماض والقلويات ودرجة الحموضة|Acides, bases et pH", "chemistry:ph-lab"),
    U("Light: reflection and refraction|الضوء: الانعكاس والانكسار|La lumière : réflexion et réfraction", "physics:mirrors"),
    U("Sound waves|الموجات الصوتية|Les ondes sonores", "physics:sound-waves"),
    U("Magnetism|المغناطيسية|Le magnétisme", "physics:magnets"),
  ];
  G[9].science = [
    U("Genes, DNA and inheritance|الجينات والحمض النووي والوراثة|Gènes, ADN et hérédité", "biology:dna-pairs"),
    U("Ecosystems and food webs|الأنظمة البيئية والشبكات الغذائية|Écosystèmes et réseaux alimentaires", "biology:food-chains"),
    U("Atomic structure|تركيب الذرة|La structure de l'atome", "chemistry:atom-builder"),
    U("Symbols and formulae|الرموز والصيغ الكيميائية|Symboles et formules", "chemistry:element-symbols"),
    U("Chemical reactions and equations|التفاعلات والمعادلات الكيميائية|Réactions et équations chimiques", "chemistry:balance-equations"),
    U("Current, voltage and resistance|التيار والجهد والمقاومة|Intensité, tension et résistance", "physics:circuits"),
    U("Density and pressure|الكثافة والضغط|Masse volumique et pression", "physics:float-sink"),
    U("Energy transfers|انتقال الطاقة|Les transferts d'énergie", "physics:energy-ramp"),
    U("Climate and the atmosphere|المناخ والغلاف الجوي|Le climat et l'atmosphère"),
  ];
  G[10].biology = [
    U("Characteristics and classification of living things|خصائص الكائنات الحية وتصنيفها|Caractéristiques et classification du vivant", "biology:animal-classes"),
    U("Cell structure|تركيب الخلية|La structure de la cellule", "biology:cell-explorer"),
    U("Movement into and out of cells|الانتقال عبر غشاء الخلية|Les échanges à travers la membrane"),
    U("Biological molecules and enzymes|الجزيئات الحيوية والإنزيمات|Molécules biologiques et enzymes"),
    U("Plant nutrition|التغذية في النبات|La nutrition des plantes", "biology:photosynthesis"),
    U("Human nutrition|التغذية في الإنسان|La nutrition humaine", "biology:digestion"),
    U("Transport in animals|النقل في الحيوانات|Le transport chez les animaux", "biology:heart-blood"),
    U("Gas exchange and respiration|تبادل الغازات والتنفس|Échanges gazeux et respiration"),
  ];
  G[11].biology = [
    U("Diseases and immunity|الأمراض والمناعة|Maladies et immunité"),
    U("Coordination: nerves and hormones|التنسيق: الأعصاب والهرمونات|La coordination : nerfs et hormones"),
    U("Inheritance and DNA|الوراثة والحمض النووي|Hérédité et ADN", "biology:dna-pairs"),
    U("Variation and natural selection|التباين والانتقاء الطبيعي|Variation et sélection naturelle"),
    U("Organisms and their environment|الكائنات الحية وبيئتها|Les organismes et leur environnement", "biology:food-chains"),
    U("Human influences on ecosystems|تأثير الإنسان في الأنظمة البيئية|L'impact humain sur les écosystèmes"),
    U("Biotechnology|التقانة الحيوية|Les biotechnologies"),
  ];
  G[12].biology = [
    U("Cell structure and biological molecules|تركيب الخلية والجزيئات الحيوية|Structure cellulaire et molécules biologiques", "biology:cell-explorer"),
    U("Transport in mammals|النقل في الثدييات|Le transport chez les mammifères", "biology:heart-blood"),
    U("Gas exchange|تبادل الغازات|Les échanges gazeux"),
    U("Nucleic acids and protein synthesis|الأحماض النووية وبناء البروتين|Acides nucléiques et synthèse des protéines", "biology:dna-pairs"),
    U("Cell division: mitosis|انقسام الخلية: الانقسام المتساوي|La division cellulaire : la mitose"),
    U("Infectious diseases and immunity|الأمراض المعدية والمناعة|Maladies infectieuses et immunité"),
  ];
  G[10].chemistry = [
    U("States of matter|حالات المادة|Les états de la matière", "chemistry:states-of-matter"),
    U("Atoms, elements and compounds|الذرات والعناصر والمركبات|Atomes, éléments et composés", "chemistry:atom-builder", "chemistry:element-symbols"),
    U("Bonding and structure|الروابط والبنية|Liaisons et structure", "chemistry:molecule-builder"),
    U("Stoichiometry: equations and moles|الحسابات الكيميائية: المعادلات والمول|Stœchiométrie : équations et moles", "chemistry:balance-equations"),
    U("The periodic table|الجدول الدوري|Le tableau périodique", "chemistry:periodic-table"),
    U("Energetics|الطاقة في التفاعلات|L'énergétique"),
    U("Rates of reaction|سرعة التفاعل|Vitesse de réaction"),
  ];
  G[11].chemistry = [
    U("Acids, bases and salts|الأحماض والقواعد والأملاح|Acides, bases et sels", "chemistry:ph-lab"),
    U("Metals and the reactivity series|الفلزات وسلسلة النشاط|Les métaux et la série de réactivité", "chemistry:metals-nonmetals"),
    U("Electrochemistry|الكيمياء الكهربائية|L'électrochimie"),
    U("Organic chemistry|الكيمياء العضوية|La chimie organique", "chemistry:molecule-builder"),
    U("Experimental techniques and separation|التقنيات العملية والفصل|Techniques expérimentales et séparation", "chemistry:separation"),
    U("Chemistry of the environment|كيمياء البيئة|La chimie de l'environnement"),
  ];
  G[12].chemistry = [
    U("Atomic structure and the mole|تركيب الذرة والمول|Structure atomique et la mole", "chemistry:atom-builder"),
    U("Chemical bonding|الروابط الكيميائية|La liaison chimique", "chemistry:molecule-builder"),
    U("Chemical energetics|طاقة التفاعلات|L'énergétique chimique"),
    U("Reaction kinetics and equilibria|حركية التفاعل والاتزان|Cinétique et équilibres"),
    U("Periodicity|الدورية|La périodicité", "chemistry:periodic-table"),
    U("Organic chemistry|الكيمياء العضوية|La chimie organique"),
  ];
  G[10].physics = [
    U("Motion: speed, velocity and acceleration|الحركة: السرعة والتسارع|Le mouvement : vitesse et accélération", "physics:force-motion"),
    U("Mass, weight and gravity|الكتلة والوزن والجاذبية|Masse, poids et gravité", "physics:gravity"),
    U("Density|الكثافة|La masse volumique", "physics:float-sink"),
    U("Forces and projectiles|القوى والمقذوفات|Forces et projectiles", "physics:projectile"),
    U("Energy, work and power|الطاقة والشغل والقدرة|Énergie, travail et puissance", "physics:energy-ramp"),
    U("Thermal physics|الفيزياء الحرارية|La physique thermique"),
    U("Waves and sound|الموجات والصوت|Les ondes et le son", "physics:sound-waves"),
    U("Light: reflection and refraction|الضوء: الانعكاس والانكسار|La lumière : réflexion et réfraction", "physics:mirrors"),
  ];
  G[11].physics = [
    U("Electric circuits|الدوائر الكهربائية|Les circuits électriques", "physics:circuits"),
    U("Magnetism and electromagnetism|المغناطيسية والكهرومغناطيسية|Magnétisme et électromagnétisme", "physics:magnets"),
    U("Electromagnetic induction|الحث الكهرومغناطيسي|L'induction électromagnétique"),
    U("Nuclear physics|الفيزياء النووية|La physique nucléaire"),
    U("Space physics|فيزياء الفضاء|La physique de l'espace"),
  ];
  G[12].physics = [
    U("Kinematics|علم الحركة|La cinématique", "physics:projectile"),
    U("Dynamics: forces and momentum|الديناميكا: القوى والزخم|La dynamique : forces et quantité de mouvement", "physics:force-motion"),
    U("Work, energy and power|الشغل والطاقة والقدرة|Travail, énergie et puissance", "physics:energy-ramp"),
    U("Oscillations|الاهتزازات|Les oscillations", "physics:pendulum"),
    U("Waves and superposition|الموجات والتراكب|Ondes et superposition", "physics:sound-waves"),
    U("D.C. circuits|دوائر التيار المستمر|Les circuits en courant continu", "physics:circuits"),
  ];

  // Grades 7-9: the science units are shown as three subjects, Biology, Chemistry and Physics (like Grades 10-12).
  const STRAND = {
    7: { biology: [0, 1], chemistry: [2, 3, 4], physics: [5, 6, 7] },
    8: { biology: [0, 1, 2, 3], chemistry: [4, 5, 6], physics: [7, 8, 9] },
    9: { biology: [0, 1], chemistry: [2, 3, 4], physics: [5, 6, 7, 8] },
  };
  for (const g of [7, 8, 9]) { const sci = G[g].science; for (const k in STRAND[g]) G[g][k] = STRAND[g][k].map((i) => sci[i]); delete G[g].science; }

  // ---------------------------------------------------------------- ENGLISH
  const EN = {
    1: ["Letters and their sounds (phonics)|الحروف وأصواتها|Les lettres et leurs sons", "Reading short words and sentences|قراءة كلمات وجمل قصيرة|Lire des mots et des phrases courtes", "Capital letters and full stops|الحروف الكبيرة والنقطة|Majuscules et points", "Stories and rhymes|القصص والأناشيد|Histoires et comptines", "Writing simple sentences|كتابة جمل بسيطة|Écrire des phrases simples"],
    2: ["Spelling patterns and digraphs|أنماط التهجئة والحروف المركّبة|Règles d'orthographe et digrammes", "Nouns, verbs and adjectives|الأسماء والأفعال والصفات|Noms, verbes et adjectifs", "Reading stories and information texts|قراءة القصص والنصوص المعلوماتية|Lire des histoires et des documentaires", "Joining sentences with 'and', 'but', 'because'|ربط الجمل بـ and وbut وbecause|Relier des phrases avec « and », « but », « because »", "Writing a short story|كتابة قصة قصيرة|Écrire une petite histoire"],
    3: ["Past and present tense|الزمن الماضي والحاضر|Le passé et le présent", "Prefixes and suffixes|البادئات واللواحق|Préfixes et suffixes", "Paragraphs|الفقرات|Les paragraphes", "Reading for meaning|القراءة للفهم|Lire pour comprendre", "Poetry and performance|الشعر والإلقاء|La poésie et sa lecture à voix haute"],
    4: ["Speech marks and punctuation|علامات التنصيص وعلامات الترقيم|Guillemets et ponctuation", "Adverbs and conjunctions|الظروف وأدوات الربط|Adverbes et conjonctions", "Fiction: characters and settings|القصص: الشخصيات والأماكن|Fiction : personnages et lieux", "Non-fiction: instructions and reports|النصوص غير القصصية: التعليمات والتقارير|Documentaires : consignes et comptes rendus", "Vocabulary and the dictionary|المفردات والقاموس|Vocabulaire et dictionnaire"],
    5: ["Clauses and complex sentences|العبارات والجمل المركّبة|Propositions et phrases complexes", "Persuasive writing|الكتابة الإقناعية|L'écriture persuasive", "Reading between the lines|القراءة ما بين السطور|Lire entre les lignes", "Figurative language|اللغة المجازية|Le langage figuré", "Spelling rules and homophones|قواعد التهجئة والكلمات المتجانسة لفظًا|Règles d'orthographe et homophones"],
    6: ["Formal and informal language|اللغة الرسمية وغير الرسمية|Langage soutenu et familier", "Active and passive voice|المبني للمعلوم والمبني للمجهول|Voix active et voix passive", "Analysing poems and stories|تحليل القصائد والقصص|Analyser poèmes et récits", "Writing to argue and discuss|الكتابة للجدال والنقاش|Écrire pour argumenter et débattre", "Advanced punctuation|علامات الترقيم المتقدمة|Ponctuation avancée"],
    7: ["Narrative writing|الكتابة السردية|L'écriture narrative", "Reading fiction critically|القراءة النقدية للقصص|Lire la fiction avec un regard critique", "Grammar for effect|القواعد من أجل التأثير|La grammaire au service du style", "Non-fiction and media texts|النصوص غير القصصية والإعلامية|Textes documentaires et médiatiques", "Poetry|الشعر|La poésie"],
    8: ["Descriptive writing|الكتابة الوصفية|L'écriture descriptive", "Language and structure in texts|اللغة والبنية في النصوص|Langue et structure des textes", "Persuasive speeches|الخطابات الإقناعية|Les discours persuasifs", "Shakespeare and drama|شكسبير والمسرح|Shakespeare et le théâtre", "Vocabulary building|بناء المفردات|Enrichir son vocabulaire"],
    9: ["Argument and discursive essays|المقالات الجدلية والنقاشية|Essais argumentatifs", "Comparing texts|المقارنة بين النصوص|Comparer des textes", "Literature: novels and poetry|الأدب: الروايات والشعر|Littérature : romans et poésie", "Summary writing|كتابة الملخص|Rédiger un résumé", "Accuracy: grammar and spelling|الدقة: القواعد والتهجئة|La précision : grammaire et orthographe"],
    10: ["Reading comprehension|فهم المقروء|Compréhension écrite", "Directed writing|الكتابة الموجّهة|L'écriture dirigée", "Summary skills|مهارات التلخيص|Techniques de résumé", "Descriptive and narrative composition|الإنشاء الوصفي والسردي|Rédaction descriptive et narrative"],
    11: ["Analysing writers' language|تحليل لغة الكتّاب|Analyser la langue des auteurs", "Argumentative composition|الإنشاء الجدلي|Rédaction argumentative", "Exam practice: reading|التدريب على الامتحان: القراءة|Entraînement à l'examen : lecture", "Exam practice: writing|التدريب على الامتحان: الكتابة|Entraînement à l'examen : écriture"],
    12: ["Language analysis|تحليل اللغة|Analyse de la langue", "Writing for audiences and purposes|الكتابة لجماهير وأغراض مختلفة|Écrire selon le public et l'objectif", "Language change and English in the world|تطور اللغة والإنجليزية في العالم|L'évolution de la langue et l'anglais dans le monde", "Literary texts|النصوص الأدبية|Textes littéraires"],
  };
  // ---------------------------------------------------------------- ARABIC (first language)
  const AR = {
    1: ["The Arabic alphabet and letter sounds|الحروف الهجائية وأصواتها|L'alphabet arabe et les sons des lettres", "Short vowels: fatha, damma, kasra|الحركات: الفتحة والضمة والكسرة|Les voyelles courtes : fatha, damma, kasra", "Letter shapes at the start, middle and end|أشكال الحرف في أول الكلمة ووسطها وآخرها|La forme des lettres au début, au milieu et à la fin", "Reading short words and sentences|قراءة كلمات وجمل قصيرة|Lire des mots et des phrases courtes", "Writing letters and words|كتابة الحروف والكلمات|Écrire les lettres et les mots"],
    2: ["Long vowels, tanween and shadda|المدود والتنوين والشدة|Voyelles longues, tanwin et chadda", "Sun and moon letters|اللام الشمسية واللام القمرية|Lettres solaires et lunaires", "Taa marbuta and taa maftuha|التاء المربوطة والتاء المفتوحة|Ta marbouta et ta maftouha", "Nominal and verbal sentences|الجملة الاسمية والجملة الفعلية|Phrases nominales et verbales", "Reading stories aloud|قراءة القصص بصوت عالٍ|Lire des histoires à voix haute"],
    3: ["Noun, verb and particle|الاسم والفعل والحرف|Nom, verbe et particule", "Singular, dual and plural|المفرد والمثنى والجمع|Singulier, duel et pluriel", "Pronouns|الضمائر|Les pronoms", "Spelling: hamza at the start of a word|الإملاء: همزة الوصل وهمزة القطع|Orthographe : la hamza en début de mot", "Reading comprehension|فهم المقروء|Compréhension écrite"],
    4: ["Subject and predicate (mubtada and khabar)|المبتدأ والخبر|Le sujet et le prédicat (moubtada et khabar)", "Past, present and imperative verbs|الفعل الماضي والمضارع والأمر|Verbes au passé, au présent et à l'impératif", "Adjectives and the described noun|الصفة والموصوف|L'adjectif et le nom qualifié", "Spelling: the middle hamza|الإملاء: الهمزة المتوسطة|Orthographe : la hamza au milieu du mot", "Writing a paragraph|كتابة فقرة|Écrire un paragraphe"],
    5: ["Subject and object of the verb|الفاعل والمفعول به|Le sujet et le complément d'objet", "Kana and its sisters|كان وأخواتها|Kana et ses sœurs", "The final hamza|الهمزة المتطرفة|La hamza finale", "Understanding texts and poems|فهم النصوص والأناشيد|Comprendre textes et poèmes", "Writing a story|كتابة قصة|Écrire une histoire"],
    6: ["Inna and its sisters|إنّ وأخواتها|Inna et ses sœurs", "The five nouns|الأسماء الخمسة|Les cinq noms", "Broken plurals|جمع التكسير|Les pluriels brisés", "Literary texts|النصوص الأدبية|Textes littéraires", "Letter and report writing|كتابة الرسائل والتقارير|Écrire des lettres et des comptes rendus"],
    7: ["Declinable and indeclinable words (i'rab and bina')|الإعراب والبناء|Mots déclinables et indéclinables", "Nominative cases (al-marfu'at)|المرفوعات|Les cas au nominatif", "Introduction to rhetoric: simile|مدخل إلى البلاغة: التشبيه|Initiation à la rhétorique : la comparaison", "Poetry and prose|الشعر والنثر|Poésie et prose", "Expressive writing|التعبير الكتابي|L'expression écrite"],
    8: ["Accusative cases (al-mansubat)|المنصوبات|Les cas à l'accusatif", "Genitive cases and the idafa|المجرورات والإضافة|Le génitif et l'annexion", "Metaphor|الاستعارة|La métaphore", "Analysing literary texts|تحليل النصوص الأدبية|Analyser des textes littéraires", "Argumentative writing|الكتابة الحجاجية|L'écriture argumentative"],
    9: ["Verb forms and derivation|أوزان الفعل والاشتقاق|Formes verbales et dérivation", "Conditional sentences|أسلوب الشرط|Les phrases conditionnelles", "Metonymy and figures of speech|الكناية والمحسنات البديعية|La métonymie et les figures de style", "Modern and classical poetry|الشعر الحديث والقديم|Poésie moderne et classique", "Essay writing|كتابة المقالة|Rédiger un essai"],
    10: ["Reading comprehension of varied texts|فهم نصوص متنوعة|Compréhension de textes variés", "Directed writing|الكتابة الموجّهة|L'écriture dirigée", "Composition|الإنشاء|La rédaction", "Grammar in context|القواعد في السياق|La grammaire en contexte"],
    11: ["Summary and analysis|التلخيص والتحليل|Résumé et analyse", "Argumentative composition|الإنشاء الحجاجي|Rédaction argumentative", "Exam practice: reading|التدريب على الامتحان: القراءة|Entraînement à l'examen : lecture", "Exam practice: writing|التدريب على الامتحان: الكتابة|Entraînement à l'examen : écriture"],
    12: ["Arabic literature through the ages|الأدب العربي عبر العصور|La littérature arabe à travers les siècles", "Rhetoric (balagha)|البلاغة|La rhétorique (balagha)", "Literary criticism|النقد الأدبي|La critique littéraire", "Advanced writing|الكتابة المتقدمة|L'écriture avancée"],
  };
  // ---------------------------------------------------------------- FRENCH (foreign language)
  const FR = {
    1: ["Greetings and introducing yourself|التحية والتعريف بالنفس|Les salutations et se présenter", "Numbers 1 to 20|الأعداد من 1 إلى 20|Les nombres de 1 à 20", "Colours|الألوان|Les couleurs", "My family|عائلتي|Ma famille"],
    2: ["School and classroom objects|المدرسة وأدوات الصف|L'école et les objets de la classe", "Animals|الحيوانات|Les animaux", "Days and months|الأيام والأشهر|Les jours et les mois", "Numbers to 50|الأعداد حتى 50|Les nombres jusqu'à 50"],
    3: ["The body|الجسم|Le corps", "Food and drink|الطعام والشراب|La nourriture et les boissons", "Articles: le, la, les, un, une|أدوات التعريف والتنكير|Les articles : le, la, les, un, une", "The verbs être and avoir|الفعلان être وavoir|Les verbes être et avoir"],
    4: ["My house|بيتي|Ma maison", "Clothes|الملابس|Les vêtements", "The weather|الطقس|La météo", "Present tense of -er verbs|المضارع للأفعال المنتهية بـ -er|Le présent des verbes en -er"],
    5: ["The town and directions|المدينة والاتجاهات|La ville et les directions", "Hobbies and sport|الهوايات والرياضة|Les loisirs et le sport", "Adjective agreement|مطابقة الصفة|L'accord des adjectifs", "Asking questions|طرح الأسئلة|Poser des questions"],
    6: ["Time and daily routine|الوقت والروتين اليومي|L'heure et la routine quotidienne", "The verbs aller and faire|الفعلان aller وfaire|Les verbes aller et faire", "The near future|المستقبل القريب|Le futur proche", "Negation|النفي|La négation"],
    7: ["The perfect tense with avoir|الماضي المركّب مع avoir|Le passé composé avec avoir", "Holidays and travel|العطل والسفر|Les vacances et les voyages", "Shopping|التسوّق|Les achats", "Reflexive verbs|الأفعال الانعكاسية|Les verbes pronominaux"],
    8: ["The perfect tense with être|الماضي المركّب مع être|Le passé composé avec être", "The imperfect tense|الماضي الناقص|L'imparfait", "Health and the body|الصحة والجسم|La santé et le corps", "Media and technology|الإعلام والتقنية|Les médias et la technologie"],
    9: ["The future tense|المستقبل البسيط|Le futur simple", "The environment|البيئة|L'environnement", "Object pronouns|ضمائر المفعول به|Les pronoms compléments", "School and future plans|المدرسة وخطط المستقبل|L'école et les projets d'avenir"],
    10: ["Everyday activities|الأنشطة اليومية|La vie quotidienne", "Personal and social life|الحياة الشخصية والاجتماعية|La vie personnelle et sociale", "The world around us|العالم من حولنا|Le monde qui nous entoure", "Reading and listening skills|مهارتا القراءة والاستماع|Compréhension écrite et orale"],
    11: ["The world of work|عالم العمل|Le monde du travail", "The international world|العالم الدولي|Le monde international", "Writing tasks|مهام الكتابة|Les tâches d'expression écrite", "Speaking practice|التدريب على المحادثة|Entraînement à l'oral"],
    12: ["Current affairs and society|القضايا الراهنة والمجتمع|L'actualité et la société", "French-speaking cultures|الثقافات الناطقة بالفرنسية|Les cultures francophones", "Advanced grammar: the subjunctive|القواعد المتقدمة: صيغة الشرط والتمني|Grammaire avancée : le subjonctif", "Essay writing|كتابة المقالة|La dissertation"],
  };
  // ---------------------------------------------------------------- WORLD GEOGRAPHY: the same full set of globe games for every grade
  const GEO_ALL = [
    ["Countries of the world|دول العالم|Les pays du monde", "geo:study", "geo:countries"],
    ["Capitals and flags|العواصم والأعلام|Capitales et drapeaux", "geo:capitals", "geo:flags"],
    ["Continents and oceans|القارات والمحيطات|Continents et océans", "geo:continents", "geo:oceans"],
    ["Seas and straits|البحار والمضائق|Mers et détroits", "geo:seas", "geo:straits"],
    ["Rivers and lakes|الأنهار والبحيرات|Fleuves et lacs", "geo:rivers", "geo:lakes"],
    ["Islands and archipelagos|الجزر والأرخبيلات|Îles et archipels", "geo:islands", "geo:archipelagos"],
    ["Deserts, mountains and mountain ranges|الصحاري والجبال والسلاسل الجبلية|Déserts, montagnes et chaînes de montagnes", "geo:deserts", "geo:mountains", "geo:ranges"],
    ["Regions and great cities|المناطق والمدن الكبرى|Régions et grandes villes", "geo:regions", "geo:cities"],
    ["Latitude and longitude|خطوط الطول والعرض|Latitude et longitude", "geo:latlong"],
  ];
  for (let g = 1; g <= 12; g++) {
    G[g].english = EN[g].map((x) => U(x));
    G[g].arabic = AR[g].map((x) => U(x));
    G[g].french = FR[g].map((x) => U(x));
    G[g].geography = GEO_ALL.map(([t, ...games]) => U(t, ...games));
  }

  window.ZV_CURRICULUM = { SUBJECTS, STAGES, grades: G, order: ["math", "science", "chemistry", "biology", "physics", "english", "arabic", "french", "geography"] };
})();
