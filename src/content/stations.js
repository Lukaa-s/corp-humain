/**
 * Contenu du voyage. Chaque escale existe en deux écritures :
 *   e — version enfant  (dès 7 ans : images concrètes, comparaisons, tutoiement)
 *   a — version adulte  (terminologie exacte, chiffres, physiologie)
 * Les positions 3D des points d'intérêt vivent dans src/world/*.js,
 * appariées par leur clé.
 */

export const STATIONS = [
  /* ══════════════════ 1 ══════════════════ */
  {
    id: 'peau', accent: '#ffb38a', map: [88, 58],
    name: { e: 'La peau', a: 'La peau' },
    sub: { e: 'Le sas d’entrée', a: 'Épiderme · couche cornée' },
    fog: { color: 0x9a6144, density: 0.0011 },
    ambience: { base: 48, cutoff: 260, drone: 0.13, noise: 0.16, hiss: 620 },
    intro: {
      e: 'Bienvenue à bord. On rétrécit… et on se pose sur ta <b>peau</b>. Vue d’ici, elle ressemble à un désert de dunes, avec des poils grands comme des arbres.',
      a: 'Début du voyage : la <b>surface cutanée</b>, à l’échelle du micron. Ce paysage de plaques est la couche cornée ; le tunnel devant nous est un pore.',
    },
    card: {
      e: {
        kicker: 'Escale 1', title: 'Un manteau vivant',
        html: `<p>La peau est le <b>plus grand organe</b> de ton corps. Étalée, elle couvrirait presque une porte : environ deux mètres carrés.</p>
               <p>Ces dalles sous nos pieds sont des <em>cellules mortes</em>, aplaties et collées comme les tuiles d’un toit. Elles empêchent l’eau de sortir et les microbes d’entrer. En dessous, des cellules toutes neuves poussent sans arrêt et remontent vers la surface.</p>
               <p>Résultat : <b>tu changes de peau tous les mois</b>, sans même t’en rendre compte.</p>`,
        stats: [['≈ 2 m²', 'la surface de ta peau, à peu près une porte'],
                ['1 mois', 'pour fabriquer une peau entièrement neuve'],
                ['40 000', 'cellules mortes perdues… chaque minute'],
                ['5 mm', 'l’épaisseur sous le talon, contre 0,5 mm sur la paupière']],
      },
      a: {
        kicker: 'Escale 1', title: 'La frontière du corps',
        html: `<p>Avec ses <b>1,5 à 2 m²</b> et près de 4 kg avec l’hypoderme, la peau est le plus vaste organe de l’économie corporelle. Elle est d’abord une <em>barrière</em> : thermique, mécanique, immunitaire, hydrique.</p>
               <p>Ce relief est le <b>stratum corneum</b> : une quinzaine de couches de cornéocytes anucléés, gorgés de kératine, cimentés par un mortier lipidique (céramides, cholestérol, acides gras libres). Le modèle classique parle de « briques et mortier ».</p>
               <p>Sous eux, la couche basale produit sans relâche de nouveaux kératinocytes qui migrent vers la surface en se kératinisant. Le renouvellement complet de l’épiderme prend environ <b>28 jours</b>.</p>`,
        stats: [['1,5–2 m²', 'surface cutanée totale'],
                ['≈ 28 j', 'temps de renouvellement épidermique'],
                ['2–5 M', 'glandes sudoripares'],
                ['0,05–5 mm', 'épaisseur de l’épiderme selon la région']],
      },
    },
    spots: {
      poil: {
        label: { e: 'Un poil', a: 'Follicule pileux' },
        e: { title: 'L’arbre de la peau', html: `<p>Un poil, c’est de la <b>kératine</b> — la même matière que tes ongles. Il pousse depuis une petite poche enfoncée dans la peau, et le muscle qui l’accompagne le redresse quand tu as froid : c’est la <em>chair de poule</em>.</p>` },
        a: { title: 'Follicule pileux', html: `<p>Invagination épidermique abritant la matrice germinative. Le <b>muscle arrecteur</b> assure la piloérection ; la <b>glande sébacée</b> annexée y déverse le sébum qui lubrifie tige et surface. Le follicule est aussi une <em>niche de cellules souches</em> mobilisée lors de la cicatrisation.</p>` },
      },
      pore: {
        label: { e: 'Le tunnel', a: 'Ostium sudoripare' },
        e: { title: 'La porte d’entrée', html: `<p>Ce puits est un <b>pore</b> : le trou par lequel sort la sueur. C’est notre entrée. Quand tu as chaud, des millions de petites glandes envoient de l’eau ici pour te refroidir.</p>` },
        a: { title: 'Le pore, notre voie d’accès', html: `<p>Débouché d’une <b>glande sudoripare eccrine</b>. La sudation est le principal levier de thermolyse : jusqu’à <em>1 à 2 litres par heure</em> en effort intense. Le film hydrolipidique qui en résulte maintient un pH acide (4,7–5,7) hostile aux pathogènes.</p>` },
      },
      corne: {
        label: { e: 'Les dalles', a: 'Cornéocytes' },
        e: { title: 'Des tuiles vivantes', html: `<p>Chaque « dalle » est une cellule <b>morte</b> et aplatie. Elle a fait tout un voyage : née tout en bas, elle a mis un mois pour monter jusqu’ici. Puis elle s’envole en poussière.</p>` },
        a: { title: 'Cornéocytes', html: `<p>Kératinocytes terminaux, anucléés, remplis de filaments de kératine et entourés d’une enveloppe cornée réticulée. Leur cohésion repose sur les <b>cornéodesmosomes</b>, dégradés progressivement par des protéases : c’est la <em>desquamation</em>.</p>` },
      },
    },
    quiz: {
      e: { q: 'En combien de temps ta peau se renouvelle-t-elle entièrement ?', opts: ['En un mois environ', 'En un an', 'Jamais : c’est la même toute la vie'], ok: 0,
           fb: 'Oui ! <b>Environ 28 jours.</b> Tu portes une peau plus jeune que ton dernier anniversaire.' },
      a: { q: 'Quelle structure assure l’essentiel de la fonction barrière cutanée ?', opts: ['Le stratum corneum', 'Le derme papillaire', 'L’hypoderme'], ok: 0,
           fb: 'Exact. Le <b>stratum corneum</b> et son ciment lipidique intercornéocytaire limitent la perte insensible en eau et l’entrée des xénobiotiques.' },
    },
  },

  /* ══════════════════ 2 ══════════════════ */
  {
    id: 'sang', accent: '#ff5a6e', map: [76, 118],
    name: { e: 'La rivière rouge', a: 'L’artère' },
    sub: { e: 'Dans le sang', a: 'Lumière artérielle · endothélium' },
    fog: { color: 0x2a0409, density: 0.0105 },
    ambience: { base: 42, cutoff: 220, drone: 0.2, noise: 0.3, hiss: 340 },
    intro: {
      e: 'Nous voilà dans un <b>vaisseau sanguin</b> — un tunnel rouge où tout file à toute vitesse. Ces galettes rouges autour de nous transportent l’oxygène.',
      a: 'Nous naviguons à contre-courant dans une <b>artère</b>. Autour de nous : hématies, leucocytes et plaquettes, poussés par l’onde de pression cardiaque.',
    },
    card: {
      e: {
        kicker: 'Escale 2', title: 'Cinq litres qui n’arrêtent jamais',
        html: `<p>Le sang, c’est le <b>service de livraison</b> du corps. Il apporte l’oxygène et la nourriture partout, et repart avec les déchets.</p>
               <p>Les galettes rouges sont les <em>globules rouges</em> : de vrais camions à oxygène. Il y en a tellement que si on les mettait bout à bout… on ferait plusieurs fois le tour de la Terre.</p>
               <p>Et tout ce réseau de tuyaux, mis bout à bout, mesurerait <b>100 000 kilomètres</b>. Deux fois et demie le tour du monde, dans une seule personne.</p>`,
        stats: [['5 litres', 'de sang chez un adulte'],
                ['100 000 km', 'de vaisseaux bout à bout'],
                ['≈ 1 minute', 'pour faire un tour complet du corps'],
                ['120 jours', 'la vie d’un globule rouge']],
      },
      a: {
        kicker: 'Escale 2', title: 'Le tissu liquide',
        html: `<p>Le sang est un <b>tissu conjonctif liquide</b> : 55 % de plasma, 45 % d’éléments figurés. Chez l’adulte, la volémie avoisine <b>5 litres</b>, soit 7 à 8 % de la masse corporelle.</p>
               <p>La paroi qui nous entoure est une artère : intima (endothélium), média riche en fibres musculaires lisses et en élastine, adventice. Son <em>élasticité</em> transforme le débit pulsé du ventricule en flux quasi continu à l’étage capillaire — c’est l’effet Windkessel.</p>
               <p>Dans l’aorte, le sang file à environ <b>40 cm/s</b> en systole ; dans un capillaire, il ralentit à moins de 1 mm/s — le temps nécessaire aux échanges.</p>`,
        stats: [['≈ 5 L', 'volémie de l’adulte'],
                ['4,5–5,5 M/mm³', 'concentration en hématies'],
                ['100 000 km', 'longueur cumulée du réseau vasculaire'],
                ['≈ 40 cm/s', 'vitesse systolique dans l’aorte']],
      },
    },
    spots: {
      hematie: {
        label: { e: 'Globule rouge', a: 'Hématie' },
        e: { title: 'Le camion à oxygène', html: `<p>Creux des deux côtés comme un coussin dégonflé, il se plie pour passer dans les tuyaux les plus étroits. Il ne vit que <b>4 mois</b>, puis il est recyclé. Ton corps en fabrique <em>2 millions par seconde</em>.</p>` },
        a: { title: 'Hématie', html: `<p>Cellule anucléée biconcave de 7–8 µm, déformable jusqu’à franchir des capillaires de 3 µm. Chaque hématie renferme près de <b>270 millions de molécules d’hémoglobine</b>, chacune fixant jusqu’à quatre O₂. Durée de vie : <em>120 jours</em>, avant épuration splénique.</p>` },
      },
      leuco: {
        label: { e: 'Globule blanc', a: 'Leucocyte' },
        e: { title: 'Le garde du corps', html: `<p>Plus gros et plus rare, il patrouille. S’il repère un microbe, il le poursuit, l’avale et le digère. Certains gardent même <b>le souvenir</b> des intrus déjà rencontrés.</p>` },
        a: { title: 'Leucocyte', html: `<p>4 000 à 10 000/mm³. Les polynucléaires neutrophiles assurent la phagocytose de première ligne ; les lymphocytes portent l’immunité adaptative et la <em>mémoire immunitaire</em>. Ils quittent la lumière vasculaire par <b>diapédèse</b>, en roulant puis en traversant l’endothélium.</p>` },
      },
      plaquette: {
        label: { e: 'Plaquettes', a: 'Thrombocytes' },
        e: { title: 'Le pansement de poche', html: `<p>Ces petits éclats se collent instantanément sur une déchirure et forment un bouchon. Sans eux, la moindre coupure ne s’arrêterait jamais.</p>` },
        a: { title: 'Thrombocytes', html: `<p>Fragments cytoplasmiques de mégacaryocytes, 150 000–400 000/mm³. Adhésion au collagène sous-endothélial via le facteur von Willebrand, activation, agrégation : c’est l’<b>hémostase primaire</b>, relayée par la cascade de coagulation.</p>` },
      },
      paroi: {
        label: { e: 'La paroi', a: 'Endothélium' },
        e: { title: 'Le tapis vivant', html: `<p>Le tunnel n’est pas un tuyau mort : sa surface est faite de cellules bien rangées, lisses comme du carrelage, pour que le sang glisse sans accrocher.</p>` },
        a: { title: 'Endothélium', html: `<p>Monocouche de cellules jointives — près de <b>700 m²</b> à l’échelle de l’organisme. Loin d’être passif, il régule le tonus vasculaire (monoxyde d’azote, endothéline), l’hémostase et le passage des leucocytes. Sa <em>dysfonction</em> ouvre la voie à l’athérosclérose.</p>` },
      },
    },
    quiz: {
      e: { q: 'Combien de kilomètres de vaisseaux as-tu dans le corps ?', opts: ['100 000 km', '500 km', '12 km'], ok: 0,
           fb: 'Incroyable mais vrai : <b>100 000 km</b>, soit deux fois et demie le tour de la Terre.' },
      a: { q: 'Combien de molécules d’O₂ une hémoglobine peut-elle fixer ?', opts: ['Quatre', 'Une', 'Vingt-sept'], ok: 0,
           fb: 'Quatre : une par hème. La <b>coopérativité</b> entre sous-unités donne à la courbe de saturation sa forme sigmoïde.' },
    },
  },

  /* ══════════════════ 3 ══════════════════ */
  {
    id: 'coeur', accent: '#e8384f', map: [50, 62],
    name: { e: 'Le cœur', a: 'Le cœur' },
    sub: { e: 'La grande pompe', a: 'Ventricule gauche · valve mitrale' },
    fog: { color: 0x33050c, density: 0.0026 },
    ambience: { base: 38, cutoff: 190, drone: 0.24, noise: 0.28, hiss: 240 },
    intro: {
      e: 'Attention, ça secoue ! Nous sommes <b>à l’intérieur du cœur</b>. Ces murs qui bougent sont des muscles, et la grande porte devant nous s’ouvre à chaque battement.',
      a: 'Cavité <b>ventriculaire gauche</b>. Devant nous, l’appareil valvulaire mitral et ses cordages ; autour, le myocarde, épais de plus d’un centimètre.',
    },
    card: {
      e: {
        kicker: 'Escale 3', title: 'La pompe qui ne dort jamais',
        html: `<p>Ton cœur est un <b>muscle creux</b>, à peu près de la taille de ton poing. Il a quatre pièces : deux en haut, deux en bas.</p>
               <p>À chaque battement, il se serre d’un coup et propulse le sang. Les « portes » entre les pièces claquent en se fermant : c’est ce <em>boum-boum</em> qu’on entend avec un stéthoscope.</p>
               <p>Il bat environ <b>100 000 fois par jour</b>. Depuis ta naissance, il ne s’est jamais arrêté — pas une seconde.</p>`,
        stats: [['100 000', 'battements par jour'],
                ['7 000 litres', 'de sang poussés chaque jour'],
                ['1 poing', 'sa taille, à peu près la tienne'],
                ['0 pause', 'depuis avant même ta naissance']],
      },
      a: {
        kicker: 'Escale 3', title: 'Deux pompes en série',
        html: `<p>Le cœur est un <b>double organe</b> : le cœur droit envoie le sang désaturé vers les poumons (petite circulation), le cœur gauche propulse le sang oxygéné vers l’organisme (grande circulation). Masse : <b>250 à 350 g</b>.</p>
               <p>La contraction naît du <b>nœud sinusal</b>, pacemaker naturel logé dans l’oreillette droite, puis se propage par le nœud atrio-ventriculaire, le faisceau de His et le réseau de Purkinje — d’où la synchronisation quasi parfaite des parois.</p>
               <p>Au repos, le débit cardiaque atteint <b>5 L/min</b> (70 mL × 70 bpm) ; à l’effort maximal, il peut être multiplié par cinq. Les valves, purement passives, sont ouvertes ou fermées par les seuls gradients de pression.</p>`,
        stats: [['5 L/min', 'débit cardiaque au repos'],
                ['≈ 70 mL', 'volume d’éjection systolique'],
                ['0,8 s', 'durée d’un cycle à 75 bpm'],
                ['≈ 2 milliards', 'battements sur une vie']],
      },
    },
    spots: {
      valve: {
        label: { e: 'La grande porte', a: 'Valve mitrale' },
        e: { title: 'Une porte à sens unique', html: `<p>Elle s’ouvre pour laisser passer le sang, puis se referme d’un coup pour l’empêcher de revenir en arrière. C’est le premier <b>« boum »</b> du battement.</p>` },
        a: { title: 'Valve mitrale', html: `<p>Valve atrio-ventriculaire gauche, à <b>deux feuillets</b>. Sa fermeture au début de la systole engendre le premier bruit (B1). Les cordages tendineux, tendus par les piliers, l’empêchent de se retourner dans l’oreillette : c’est l’<em>appareil sous-valvulaire</em>.</p>` },
      },
      myocarde: {
        label: { e: 'Le muscle', a: 'Myocarde' },
        e: { title: 'Un muscle infatigable', html: `<p>Ce mur épais est un muscle très particulier : il se contracte <b>tout seul</b>, sans que tu y penses, et il ne se fatigue jamais. Il a même ses propres tuyaux pour se nourrir.</p>` },
        a: { title: 'Myocarde', html: `<p>Muscle strié à commande involontaire. Ses cellules sont couplées électriquement par des <b>disques intercalaires</b> (jonctions communicantes) : le ventricule se comporte comme un syncytium fonctionnel. Sa densité en mitochondries dépasse 30 % du volume cellulaire — d’où sa <em>dépendance absolue</em> à la perfusion coronaire.</p>` },
      },
      cordage: {
        label: { e: 'Les cordes', a: 'Cordages tendineux' },
        e: { title: 'Les haubans de la porte', html: `<p>Ces filins retiennent la porte quand le sang pousse très fort — comme les cordes d’un parachute. Sans eux, elle se retournerait.</p>` },
        a: { title: 'Cordages tendineux', html: `<p>Faisceaux collagéniques reliant le bord libre des feuillets aux muscles papillaires. Ils ne ferment pas la valve : ils <b>limitent son excursion</b>. Leur rupture provoque une insuffisance mitrale aiguë.</p>` },
      },
      sinusal: {
        label: { e: 'Le chef d’orchestre', a: 'Nœud sinusal' },
        e: { title: 'Qui donne le rythme ?', html: `<p>Un petit groupe de cellules envoie une <b>impulsion électrique</b> à chaque battement. C’est lui qui décide du tempo — et qui accélère quand tu cours.</p>` },
        a: { title: 'Nœud sinusal', html: `<p>Amas de cellules automatiques à la jonction veine cave supérieure / oreillette droite. Leur <b>dépolarisation diastolique lente</b> (courant funny I<sub>f</sub>) impose le rythme, modulé en permanence par les systèmes sympathique et parasympathique.</p>` },
      },
    },
    quiz: {
      e: { q: 'Combien de fois ton cœur bat-il en une journée ?', opts: ['Environ 100 000 fois', 'Environ 1 000 fois', 'Environ 10 millions de fois'], ok: 0,
           fb: 'Bravo ! <b>Environ 100 000 battements</b> par jour, soit à peu près 70 par minute au repos.' },
      a: { q: 'Où naît normalement l’impulsion électrique cardiaque ?', opts: ['Nœud sinusal', 'Faisceau de His', 'Réseau de Purkinje'], ok: 0,
           fb: 'Le <b>nœud sinusal</b>, structure la plus rapide de la hiérarchie ; les relais sous-jacents ne prennent la main qu’en cas de défaillance.' },
    },
  },

  /* ══════════════════ 4 ══════════════════ */
  {
    id: 'poumons', accent: '#7fd8ff', map: [66, 60],
    name: { e: 'Les poumons', a: 'Les alvéoles' },
    sub: { e: 'La forêt de bulles', a: 'Sacs alvéolaires · barrière alvéolo-capillaire' },
    fog: { color: 0x1b2833, density: 0.0022 },
    ambience: { base: 62, cutoff: 700, drone: 0.1, noise: 0.34, hiss: 1200 },
    intro: {
      e: 'Écoute : ça <b>respire</b>. Toutes ces bulles se gonflent et se dégonflent. C’est ici que l’air entre dans ton sang.',
      a: 'Zone d’échange : les <b>sacs alvéolaires</b>. Chaque bulle est enserrée d’un réseau capillaire ; la barrière qui les sépare mesure moins d’un micron.',
    },
    card: {
      e: {
        kicker: 'Escale 4', title: 'Un terrain de tennis plié dans ta poitrine',
        html: `<p>L’air que tu respires descend par des tuyaux qui se divisent encore et encore, comme les branches d’un arbre à l’envers. Tout au bout : <b>des millions de petites bulles</b>.</p>
               <p>Chaque bulle est entourée de tuyaux minuscules remplis de sang. L’oxygène traverse la paroi — <em>50 fois plus fine qu’un cheveu</em> — et saute dans le sang. Le gaz usé fait le chemin inverse, et tu le souffles.</p>
               <p>Si on dépliait toutes ces bulles à plat, elles couvriraient à peu près un <b>terrain de tennis</b>.</p>`,
        stats: [['300 millions', 'de petites bulles dans tes poumons'],
                ['1 terrain de tennis', 'leur surface, dépliée'],
                ['20 000', 'respirations par jour'],
                ['0,5 micron', 'l’épaisseur de la paroi à traverser']],
      },
      a: {
        kicker: 'Escale 4', title: 'La plus grande surface d’échange du corps',
        html: `<p>L’arbre bronchique se divise sur <b>23 générations</b>, de la trachée aux sacs alvéolaires. Les seize premières conduisent l’air ; les dernières seules assurent les échanges gazeux.</p>
               <p>On compte <b>300 à 500 millions d’alvéoles</b> pour une surface d’échange de <b>70 à 100 m²</b>. La barrière alvéolo-capillaire — épithélium de type I, membranes basales fusionnées, endothélium — n’excède pas <b>0,2 à 0,6 µm</b> : l’O₂ et le CO₂ la franchissent par simple diffusion passive.</p>
               <p>Les pneumocytes de type II sécrètent le <b>surfactant</b>, film tensioactif sans lequel la tension superficielle collaberait les alvéoles à chaque expiration. Son absence chez le grand prématuré définit la maladie des membranes hyalines.</p>`,
        stats: [['70–100 m²', 'surface alvéolaire totale'],
                ['0,2–0,6 µm', 'épaisseur de la barrière'],
                ['12–16/min', 'fréquence respiratoire de repos'],
                ['≈ 6 L/min', 'ventilation minute au repos']],
      },
    },
    spots: {
      alveole: {
        label: { e: 'Une bulle d’air', a: 'Alvéole' },
        e: { title: 'La bulle magique', html: `<p>Grosse comme un grain de poussière, elle se gonfle quand tu inspires. Il y en a <b>tellement</b> que les compter une par une prendrait dix ans.</p>` },
        a: { title: 'Alvéole pulmonaire', html: `<p>Sphère de 200 à 300 µm tapissée de pneumocytes I (95 % de la surface, 5 % des cellules) et II. Les <b>pores de Kohn</b> assurent une ventilation collatérale entre alvéoles voisines.</p>` },
      },
      capillaire: {
        label: { e: 'Les tuyaux rouges', a: 'Réseau capillaire' },
        e: { title: 'Le filet de sang', html: `<p>Autour de chaque bulle court un filet de tuyaux si fins que les globules rouges doivent passer <b>à la file indienne</b>. C’est là qu’ils se rechargent en oxygène.</p>` },
        a: { title: 'Capillaires pulmonaires', html: `<p>Le lit capillaire forme une véritable <em>nappe de sang</em> autour de l’alvéole. Une hématie y séjourne <b>0,75 s</b> au repos ; l’équilibre des pressions en O₂ est atteint en un tiers de ce temps, d’où l’énorme réserve fonctionnelle à l’effort.</p>` },
      },
      surfactant: {
        label: { e: 'Le vernis', a: 'Surfactant' },
        e: { title: 'Le liquide anti-collage', html: `<p>Un film glissant recouvre l’intérieur des bulles pour les empêcher de <b>se coller</b> quand tu souffles. Sans lui, respirer serait épuisant.</p>` },
        a: { title: 'Surfactant alvéolaire', html: `<p>Complexe phospholipidique (dipalmitoyl-phosphatidylcholine) et protéique sécrété par les pneumocytes II. Il abaisse la tension superficielle et, selon la loi de <b>Laplace</b>, stabilise les alvéoles de petit rayon face aux grandes.</p>` },
      },
      bronchiole: {
        label: { e: 'Le couloir d’air', a: 'Bronchiole terminale' },
        e: { title: 'La dernière branche', html: `<p>C’est le plus petit couloir avant les bulles. Ses murs peuvent se serrer ou s’élargir selon les besoins — chez les asthmatiques, ils se serrent trop.</p>` },
        a: { title: 'Bronchiole terminale', html: `<p>Dernière division purement conductrice, dépourvue de cartilage : son calibre dépend du <b>muscle lisse</b> et donc du tonus autonome. C’est le site du bronchospasme asthmatique.</p>` },
      },
    },
    quiz: {
      e: { q: 'Si on dépliait toutes tes alvéoles, ça couvrirait…', opts: ['Un terrain de tennis', 'Une feuille de papier', 'Un stade de football'], ok: 0,
           fb: 'Oui ! Environ <b>70 à 100 m²</b> — la taille d’un terrain de tennis, replié dans ta poitrine.' },
      a: { q: 'Quel est le rôle principal du surfactant ?', opts: ['Abaisser la tension superficielle alvéolaire', 'Transporter l’oxygène', 'Filtrer les poussières'], ok: 0,
           fb: 'Il réduit la tension superficielle et <b>stabilise les alvéoles de petit rayon</b> — conséquence directe de la loi de Laplace.' },
    },
  },

  /* ══════════════════ 5 ══════════════════ */
  {
    id: 'estomac', accent: '#d9b23c', map: [45, 92],
    name: { e: 'L’estomac', a: 'L’estomac' },
    sub: { e: 'La cuve à acide', a: 'Muqueuse fundique · plis gastriques' },
    fog: { color: 0x2b2208, density: 0.0026 },
    ambience: { base: 34, cutoff: 170, drone: 0.22, noise: 0.36, hiss: 300 },
    intro: {
      e: 'Accroche-toi : on entre dans <b>l’estomac</b>. Ces grandes vagues, c’est le muscle qui mélange la nourriture. Et l’air pique un peu : ici, c’est acide !',
      a: 'Cavité gastrique. Les reliefs sont des <b>plis</b> qui s’effacent au remplissage ; l’ambiance est à pH 1,5–3,5, entretenue par les cellules pariétales.',
    },
    card: {
      e: {
        kicker: 'Escale 5', title: 'Une machine à laver acide',
        html: `<p>L’estomac n’est pas un simple sac : c’est un <b>muscle très puissant</b> qui pétrit la nourriture comme de la pâte, trois fois par minute.</p>
               <p>En même temps, il verse un liquide <em>plus acide que le vinaigre</em>. Cet acide casse les aliments en tout petits morceaux et tue la plupart des microbes avalés.</p>
               <p>Alors pourquoi l’estomac ne se digère-t-il pas lui-même ? Parce qu’il fabrique en permanence une couche de <b>mucus</b> qui le protège — et qu’il refait sa paroi tous les trois jours.</p>`,
        stats: [['1,5 litre', 'ce qu’il peut contenir sans forcer'],
                ['3 par minute', 'le nombre de vagues de brassage'],
                ['3 jours', 'pour refaire sa paroi à neuf'],
                ['2 à 4 h', 'pour vider un repas complet']],
      },
      a: {
        kicker: 'Escale 5', title: 'Chimie et mécanique',
        html: `<p>L’estomac assure trois fonctions : <b>réservoir</b>, <b>brassage</b> et <b>digestion initiale</b>. Sa capacité de repos avoisine 50 mL et s’étend au-delà d’un litre par relaxation réceptive.</p>
               <p>Les cellules pariétales sécrètent l’<b>acide chlorhydrique</b> via la pompe H⁺/K⁺-ATPase — cible des inhibiteurs de la pompe à protons. Le pH descend à 1,5–3,5, ce qui active le pepsinogène en <em>pepsine</em> et amorce la protéolyse. Les cellules principales fournissent le pepsinogène, les cellules à mucus la barrière protectrice.</p>
               <p>Cette barrière est double : gel de mucus et sécrétion de <b>bicarbonates</b> qui maintient un pH proche de 7 au contact de l’épithélium. L’épithélium de surface se renouvelle en 3 à 5 jours.</p>`,
        stats: [['1,5–3,5', 'pH du contenu gastrique'],
                ['≈ 2 L/jour', 'volume de suc gastrique'],
                ['3/min', 'fréquence des ondes péristaltiques'],
                ['B12', 'vitamine dont l’absorption dépend du facteur intrinsèque']],
      },
    },
    spots: {
      plis: {
        label: { e: 'Les vagues', a: 'Plis gastriques' },
        e: { title: 'Des vagues de muscle', html: `<p>Ces bourrelets se déplacent du haut vers le bas et écrasent la nourriture contre la sortie. On appelle ça le <b>péristaltisme</b> — le même mouvement que dans tout ton tube digestif.</p>` },
        a: { title: 'Plis et péristaltisme', html: `<p>Les plis de la muqueuse s’effacent lors du remplissage. La paroi comporte <b>trois</b> couches musculaires (longitudinale, circulaire, oblique) : c’est ce qui autorise un véritable <em>malaxage</em> et non un simple transport.</p>` },
      },
      acide: {
        label: { e: 'L’acide', a: 'Cellules pariétales' },
        e: { title: 'Plus fort que le vinaigre', html: `<p>Ces petits puits versent l’acide. Il est si puissant qu’il dissout la viande — et c’est aussi une <b>barrière anti-microbes</b> très efficace.</p>` },
        a: { title: 'Cellules pariétales', html: `<p>Elles sécrètent HCl contre un gradient de plus de <b>10⁶</b> et le <b>facteur intrinsèque</b>, indispensable à l’absorption iléale de la vitamine B12. Leur stimulation est triple : gastrine, acétylcholine, histamine.</p>` },
      },
      mucus: {
        label: { e: 'Le bouclier', a: 'Barrière muqueuse' },
        e: { title: 'Un gel qui sauve la vie', html: `<p>Une couche gluante recouvre toute la paroi. Elle empêche l’acide de toucher les cellules vivantes. Quand ce bouclier s’abîme, ça fait un <b>ulcère</b>.</p>` },
        a: { title: 'Barrière muco-bicarbonatée', html: `<p>Gel de mucines de 200 à 500 µm, associé à une sécrétion de HCO₃⁻ qui établit un <b>gradient de pH</b> de 2 dans la lumière à ~7 à la surface cellulaire. Sa rupture — AINS, <em>Helicobacter pylori</em> — est le mécanisme central de la maladie ulcéreuse.</p>` },
      },
      chyme: {
        label: { e: 'La bouillie', a: 'Chyme' },
        e: { title: 'Ce qu’il reste du repas', html: `<p>Après quelques heures, ton repas est devenu une <b>bouillie</b> liquide. Elle passe par une petite porte, cuillère par cuillère, vers l’intestin.</p>` },
        a: { title: 'Chyme gastrique', html: `<p>Suspension acide semi-liquide évacuée par le <b>pylore</b> de façon fractionnée. La vidange dépend de la composition : rapide pour les glucides, lente pour les lipides, réglée par le rétrocontrôle duodénal (CCK, sécrétine).</p>` },
      },
    },
    quiz: {
      e: { q: 'Pourquoi l’estomac ne se digère-t-il pas lui-même ?', opts: ['Une couche de mucus le protège', 'Il n’y a pas vraiment d’acide', 'Il est en métal'], ok: 0,
           fb: 'Exact : un <b>gel protecteur</b> recouvre sa paroi, et celle-ci se renouvelle tous les trois jours.' },
      a: { q: 'Quelle enzyme l’acidité gastrique active-t-elle ?', opts: ['La pepsine', 'L’amylase', 'La lipase pancréatique'], ok: 0,
           fb: 'Le pepsinogène s’auto-active en <b>pepsine</b> en dessous de pH 5 : la protéolyse commence dès l’estomac.' },
    },
  },

  /* ══════════════════ 6 ══════════════════ */
  {
    id: 'intestin', accent: '#ff9d5c', map: [50, 112],
    name: { e: 'L’intestin', a: 'L’intestin grêle' },
    sub: { e: 'La forêt de doigts', a: 'Villosités · bordure en brosse' },
    fog: { color: 0x2c1206, density: 0.0055 },
    ambience: { base: 46, cutoff: 300, drone: 0.16, noise: 0.3, hiss: 520 },
    intro: {
      e: 'Regarde cette forêt qui ondule : ce sont des <b>millions de petits doigts</b>. Ils attrapent la nourriture et la font passer dans ton sang.',
      a: 'Muqueuse du grêle. Ces reliefs digitiformes sont les <b>villosités</b> ; chacune abrite un capillaire et un vaisseau chylifère.',
    },
    card: {
      e: {
        kicker: 'Escale 6', title: 'Six mètres pliés dans ton ventre',
        html: `<p>L’intestin grêle est un tuyau de <b>6 à 7 mètres</b>, replié pour tenir dans ton ventre. C’est ici que la nourriture devient vraiment <em>toi</em>.</p>
               <p>Sa paroi n’est pas lisse : elle est couverte de doigts minuscules, eux-mêmes couverts de doigts encore plus petits. Ça multiplie énormément la surface — comme une serviette éponge, mais en mille fois mieux.</p>
               <p>Chaque doigt contient un tout petit vaisseau : les sucres, les vitamines et les protéines découpées y sautent et partent dans le sang.</p>`,
        stats: [['6–7 mètres', 'de long, plié dans ton ventre'],
                ['30 m²', 'la surface qui absorbe, dépliée'],
                ['3 à 5 heures', 'pour le traverser en entier'],
                ['3 jours', 'pour renouveler toute sa paroi']],
      },
      a: {
        kicker: 'Escale 6', title: 'L’organe de l’absorption',
        html: `<p>Duodénum, jéjunum, iléon : <b>6 à 7 mètres</b> où se joue l’essentiel de la digestion et la quasi-totalité de l’absorption.</p>
               <p>Trois niveaux de plissement amplifient la surface : valvules conniventes (×3), <b>villosités</b> (×10) et microvillosités de la bordure en brosse (×20). La surface d’absorption effective est estimée aujourd’hui à environ <b>30 m²</b> — bien loin des 200 m² longtemps cités, mais déjà considérable.</p>
               <p>Chaque villosité contient un réseau capillaire (oses, acides aminés → veine porte) et un <b>chylifère central</b> qui draine les chylomicrons vers la voie lymphatique, court-circuitant le foie. L’épithélium se renouvelle intégralement en 3 à 5 jours depuis les cryptes de Lieberkühn.</p>`,
        stats: [['≈ 30 m²', 'surface d’absorption réelle'],
                ['≈ 20 000', 'microvillosités par entérocyte'],
                ['3–5 j', 'renouvellement de l’épithélium'],
                ['10¹⁴', 'bactéries dans le tube digestif']],
      },
    },
    spots: {
      villosite: {
        label: { e: 'Un petit doigt', a: 'Villosité' },
        e: { title: 'Le doigt qui attrape', html: `<p>Il mesure moins d’un millimètre et il bouge tout seul pour brasser la nourriture autour de lui. Il y en a <b>des millions</b> côte à côte.</p>` },
        a: { title: 'Villosité intestinale', html: `<p>Saillie de 0,5 à 1 mm animée de mouvements propres par la <em>musculaire muqueuse</em>, ce qui renouvelle la couche de fluide non agitée à son contact. Son axe conjonctif porte capillaires, chylifère et terminaisons nerveuses.</p>` },
      },
      brosse: {
        label: { e: 'Les poils du doigt', a: 'Bordure en brosse' },
        e: { title: 'Encore plus petit !', html: `<p>Chaque doigt est lui-même couvert de <b>milliers de poils microscopiques</b>. C’est le secret de l’intestin : ajouter de la surface, encore et encore.</p>` },
        a: { title: 'Bordure en brosse', html: `<p>Environ 20 000 microvillosités par entérocyte, porteuses des <b>enzymes de membrane</b> — lactase, sucrase-isomaltase, peptidases — qui achèvent l’hydrolyse au contact même des transporteurs. Le déficit en lactase explique l’intolérance au lactose.</p>` },
      },
      chylifere: {
        label: { e: 'Le tuyau blanc', a: 'Chylifère' },
        e: { title: 'La route des graisses', html: `<p>Les graisses ne prennent pas la même route que le reste : elles empruntent un <b>tuyau blanc</b> qui rejoint la circulation plus loin.</p>` },
        a: { title: 'Vaisseau chylifère', html: `<p>Capillaire lymphatique borgne au centre de la villosité. Il collecte les <b>chylomicrons</b>, trop volumineux pour l’endothélium sanguin, et les conduit au canal thoracique : les lipides échappent ainsi au premier passage hépatique.</p>` },
      },
      microbiote: {
        label: { e: 'Les bactéries amies', a: 'Microbiote' },
        e: { title: 'Des milliards de colocataires', html: `<p>Des bactéries vivent dans ton intestin — et elles sont <b>utiles</b> : elles digèrent ce que tu ne peux pas digérer et t’aident à te défendre.</p>` },
        a: { title: 'Microbiote intestinal', html: `<p>≈ 10¹⁴ micro-organismes, majoritairement coliques, pour un métagénome cent fois plus riche que le génome humain. Il fermente les fibres en <b>acides gras à chaîne courte</b>, synthétise vitamines K et B, et éduque le système immunitaire muqueux.</p>` },
      },
    },
    quiz: {
      e: { q: 'À quoi servent les millions de petits doigts de l’intestin ?', opts: ['À augmenter la surface qui absorbe', 'À pousser la nourriture', 'À fabriquer de l’acide'], ok: 0,
           fb: 'Bien vu ! Plus de surface = plus de nourriture récupérée. Dépliés, ils couvriraient <b>30 m²</b>.' },
      a: { q: 'Par quelle voie les chylomicrons quittent-ils la villosité ?', opts: ['Le chylifère lymphatique', 'La veine porte', 'L’artère mésentérique'], ok: 0,
           fb: 'Par la <b>lymphe</b> : les lipides rejoignent la circulation via le canal thoracique, sans premier passage hépatique.' },
    },
  },

  /* ══════════════════ 7 ══════════════════ */
  {
    id: 'foie', accent: '#b8543f', map: [66, 86],
    name: { e: 'Le foie', a: 'Le foie' },
    sub: { e: 'L’usine du corps', a: 'Lobule hépatique · sinusoïdes' },
    fog: { color: 0x2a0d0a, density: 0.0018 },
    ambience: { base: 40, cutoff: 210, drone: 0.2, noise: 0.22, hiss: 380 },
    intro: {
      e: 'Ici, tout est bien rangé : le <b>foie</b> est une usine. Ces couloirs rouges sont des lignes de production, et il y en a des centaines de milliers.',
      a: 'Architecture <b>lobulaire</b> : travées d’hépatocytes rayonnant autour d’une veine centrale, séparées par des sinusoïdes. Un même motif, répété 100 000 fois.',
    },
    card: {
      e: {
        kicker: 'Escale 7', title: 'L’usine qui fait tout',
        html: `<p>Le foie est le plus gros organe à l’intérieur du corps : <b>1,5 kg</b>. C’est à la fois une usine, un entrepôt et une station de nettoyage.</p>
               <p>Tout ce que tu manges passe d’abord par lui. Il trie : il garde le sucre pour plus tard, il fabrique ce dont le corps a besoin, et il <em>détruit</em> ce qui est toxique.</p>
               <p>Et il a un super-pouvoir : c’est le seul organe qui <b>repousse</b>. On peut en enlever une grande partie, il se reconstruit.</p>`,
        stats: [['1,5 kg', 'le plus gros organe interne'],
                ['500 métiers', 'plus de 500 tâches différentes'],
                ['1,4 L/min', 'de sang filtré'],
                ['Il repousse', 'le seul organe capable de se régénérer']],
      },
      a: {
        kicker: 'Escale 7', title: 'Le carrefour métabolique',
        html: `<p>Environ <b>1,5 kg</b>, doublement vascularisé : 75 % du sang lui vient de la <b>veine porte</b>, chargée des nutriments intestinaux, 25 % de l’artère hépatique. Il reçoit près d’un quart du débit cardiaque.</p>
               <p>L’unité fonctionnelle est le <b>lobule</b> : travées d’hépatocytes rayonnant vers une veine centrolobulaire, baignées de sinusoïdes à endothélium fenestré. Le sang circule de la périphérie vers le centre, la bile en sens inverse — un <em>contre-courant</em> parfait.</p>
               <p>Fonctions : néoglucogenèse et glycogénogenèse, synthèse de l’albumine et des facteurs de coagulation, cycle de l’urée, métabolisme des xénobiotiques (cytochromes P450, phases I et II), sécrétion biliaire, stockage du fer et des vitamines liposolubles. Sa capacité de <b>régénération</b> est unique chez l’adulte.</p>`,
        stats: [['≈ 100 000', 'lobules hépatiques'],
                ['75 %', 'de son sang vient de la veine porte'],
                ['0,5–1 L', 'de bile produite par jour'],
                ['P450', 'la famille d’enzymes qui métabolise les médicaments']],
      },
    },
    spots: {
      lobule: {
        label: { e: 'Un module', a: 'Lobule hépatique' },
        e: { title: 'Le même motif, partout', html: `<p>Le foie est fait du même petit module répété des <b>centaines de milliers de fois</b> — comme des alvéoles de ruche. Chacun travaille de la même façon.</p>` },
        a: { title: 'Lobule hépatique', html: `<p>Prisme hexagonal de 1 à 2 mm centré sur une veine centrolobulaire, bordé aux angles par les <b>espaces portes</b> (branche portale, artériole, canalicule biliaire). Un gradient d’oxygène s’installe de la périphérie au centre : c’est la <em>zonation métabolique</em>.</p>` },
      },
      hepatocyte: {
        label: { e: 'L’ouvrier', a: 'Hépatocyte' },
        e: { title: 'La cellule à tout faire', html: `<p>Une seule de ces cellules sait faire <b>des centaines de choses</b> à la fois : stocker, fabriquer, nettoyer. C’est la plus polyvalente du corps.</p>` },
        a: { title: 'Hépatocyte', html: `<p>Cellule polarisée occupant 80 % du volume hépatique, souvent binucléée et polyploïde. Riche en réticulum endoplasmique lisse (détoxication) et en <b>mitochondries</b>. Sa face apicale délimite, avec sa voisine, le <em>canalicule biliaire</em>.</p>` },
      },
      sinusoide: {
        label: { e: 'Le couloir de sang', a: 'Sinusoïde' },
        e: { title: 'Un couloir plein de trous', html: `<p>Ces couloirs laissent le sang <b>toucher directement</b> les cellules du foie — il n’y a presque pas de barrière. C’est ce qui rend le tri si efficace.</p>` },
        a: { title: 'Sinusoïde hépatique', html: `<p>Capillaire à endothélium <b>fenestré et discontinu</b>, dépourvu de lame basale continue : le plasma accède librement à l’espace de Disse et aux microvillosités hépatocytaires. On y trouve les <b>cellules de Kupffer</b>, macrophages résidents qui épurent bactéries et débris portaux.</p>` },
      },
      bile: {
        label: { e: 'La bile', a: 'Canalicule biliaire' },
        e: { title: 'Le savon des graisses', html: `<p>Le foie fabrique un liquide vert-jaune, la <b>bile</b>, stocké dans la vésicule. Au moment du repas, elle est lâchée dans l’intestin pour découper les graisses en gouttelettes.</p>` },
        a: { title: 'Voie biliaire', html: `<p>La bile — sels biliaires, phospholipides, cholestérol, bilirubine conjuguée — chemine à contre-courant du sang vers les canaux, la vésicule et le duodénum. Les sels biliaires <b>émulsifient</b> les lipides et sont réabsorbés à 95 % dans l’iléon : c’est le <em>cycle entéro-hépatique</em>.</p>` },
      },
    },
    quiz: {
      e: { q: 'Quel organe est capable de repousser après avoir été coupé ?', opts: ['Le foie', 'Le cœur', 'Le cerveau'], ok: 0,
           fb: 'Le <b>foie</b> ! C’est le seul organe interne capable de se reconstruire.' },
      a: { q: 'Quelle proportion du sang hépatique provient de la veine porte ?', opts: ['Environ 75 %', 'Environ 25 %', 'Environ 50 %'], ok: 0,
           fb: 'Trois quarts, pauvres en oxygène mais riches en nutriments : c’est le <b>premier passage hépatique</b>, décisif en pharmacologie.' },
    },
  },

  /* ══════════════════ 8 ══════════════════ */
  {
    id: 'rein', accent: '#8fa8ff', map: [40, 98],
    name: { e: 'Le rein', a: 'Le rein' },
    sub: { e: 'La station d’épuration', a: 'Néphron · glomérule' },
    fog: { color: 0x101832, density: 0.0016 },
    ambience: { base: 58, cutoff: 520, drone: 0.13, noise: 0.24, hiss: 900 },
    intro: {
      e: 'Cette pelote de tuyaux est un <b>filtre</b>. Le sang y entre sale et en ressort propre. Tout ce qui est en trop part vers la sortie…',
      a: 'Un <b>glomérule</b> : peloton capillaire enchâssé dans la capsule de Bowman. C’est ici que naît l’urine primitive, à raison de 180 litres par jour.',
    },
    card: {
      e: {
        kicker: 'Escale 8', title: 'Filtrer 180 litres pour n’en jeter qu’un',
        html: `<p>Tu as deux reins, de la taille d’un poing chacun. Leur travail : <b>nettoyer ton sang</b> en permanence.</p>
               <p>Ils sont fous de précision. Chaque jour, ils filtrent <em>180 litres</em> de liquide — l’équivalent d’une baignoire ! Puis ils récupèrent presque tout : l’eau, le sucre, le sel utile.</p>
               <p>À la fin, il ne reste qu’environ <b>1,5 litre</b> d’urine : les déchets et le trop-plein d’eau. Rien ne se perd.</p>`,
        stats: [['180 litres', 'filtrés chaque jour'],
                ['1,5 litre', 'seulement est éliminé'],
                ['1 million', 'de mini-filtres par rein'],
                ['Toutes les 30 min', 'tout ton sang y repasse']],
      },
      a: {
        kicker: 'Escale 8', title: 'L’organe de l’équilibre intérieur',
        html: `<p>Chaque rein compte environ <b>un million de néphrons</b>. Le glomérule filtre le plasma sous l’effet de la pression hydrostatique : la barrière — endothélium fenestré, membrane basale, pédicelles des podocytes — retient cellules et protéines.</p>
               <p>Le débit de filtration glomérulaire normal est de <b>120 mL/min</b>, soit près de <b>180 L par jour</b>. Le tubule en réabsorbe plus de 99 % : la totalité du glucose et des acides aminés au tube proximal, l’eau et le sodium tout au long, sous contrôle de l’ADH et de l’aldostérone.</p>
               <p>Le rein ne fait pas qu’épurer : il règle la <em>volémie</em> et la pression artérielle (système rénine-angiotensine), l’équilibre acido-basique, la calcémie (hydroxylation de la vitamine D) et l’érythropoïèse (<b>EPO</b>).</p>`,
        stats: [['≈ 120 mL/min', 'débit de filtration glomérulaire'],
                ['> 99 %', 'du filtrat est réabsorbé'],
                ['20–25 %', 'du débit cardiaque va aux reins'],
                ['1 200 mOsm/kg', 'concentration urinaire maximale']],
      },
    },
    spots: {
      glomerule: {
        label: { e: 'La pelote', a: 'Glomérule' },
        e: { title: 'La passoire', html: `<p>Un peloton de tuyaux minuscules, percés de trous si fins que seules les <b>toutes petites choses</b> passent. Les globules et les grosses protéines restent dans le sang.</p>` },
        a: { title: 'Glomérule', html: `<p>Capillaires à haute pression (≈ 45 mmHg) entre deux artérioles, dont le calibre règle finement la filtration. La <b>barrière</b> est à la fois mécanique et électrique : chargée négativement, elle repousse l’albumine. Son altération donne la <em>protéinurie</em>.</p>` },
      },
      bowman: {
        label: { e: 'La coupelle', a: 'Capsule de Bowman' },
        e: { title: 'Le récipient', html: `<p>Tout ce qui traverse le filtre tombe dans cette coupelle, puis part dans un long tuyau. C’est le début de l’urine — mais elle est encore <b>bien trop diluée</b>.</p>` },
        a: { title: 'Capsule de Bowman', html: `<p>Feuillet viscéral fait de <b>podocytes</b> dont les pédicelles enlacent les capillaires en ménageant des fentes de filtration de 25 nm, obturées par la <em>néphrine</em>. L’ultrafiltrat recueilli a la composition du plasma, protéines en moins.</p>` },
      },
      henle: {
        label: { e: 'La boucle', a: 'Anse de Henle' },
        e: { title: 'La boucle magique', html: `<p>Ce long tuyau plonge, fait demi-tour et remonte. Cette forme en épingle permet de <b>récupérer l’eau</b> — c’est pour ça que tu peux boire peu et survivre.</p>` },
        a: { title: 'Anse de Henle', html: `<p>Moteur du <b>gradient cortico-médullaire</b> par multiplication à contre-courant : branche descendante perméable à l’eau, branche ascendante imperméable mais qui pompe activement NaCl. Sans elle, aucune concentration des urines possible ; c’est la cible des diurétiques de l’anse.</p>` },
      },
      collecteur: {
        label: { e: 'La sortie', a: 'Tube collecteur' },
        e: { title: 'Le dernier réglage', html: `<p>Juste avant la sortie, le corps décide combien d’eau il garde. Si tu as soif, il en garde beaucoup : ton pipi devient <b>plus foncé</b>.</p>` },
        a: { title: 'Tube collecteur', html: `<p>Site du réglage final. L’<b>ADH</b> y insère des aquaporines-2 : la perméabilité à l’eau devient variable, et l’osmolalité urinaire peut osciller de 50 à 1 200 mOsm/kg. L’aldostérone y ajuste réabsorption sodée et excrétion potassique.</p>` },
      },
    },
    quiz: {
      e: { q: 'Combien de litres tes reins filtrent-ils chaque jour ?', opts: ['180 litres', '2 litres', '20 litres'], ok: 0,
           fb: '<b>180 litres</b> filtrés… mais 99 % sont récupérés. Il ne sort qu’un litre et demi.' },
      a: { q: 'Quelle structure crée le gradient permettant de concentrer l’urine ?', opts: ['L’anse de Henle', 'Le glomérule', 'La capsule de Bowman'], ok: 0,
           fb: 'La <b>multiplication à contre-courant</b> dans l’anse de Henle établit le gradient cortico-médullaire exploité par le tube collecteur.' },
    },
  },

  /* ══════════════════ 9 ══════════════════ */
  {
    id: 'charpente', accent: '#e8dcc8', map: [30, 168],
    name: { e: 'Os et muscles', a: 'La charpente' },
    sub: { e: 'La structure vivante', a: 'Os trabéculaire · fibre musculaire' },
    fog: { color: 0x1a1410, density: 0.0013 },
    ambience: { base: 36, cutoff: 200, drone: 0.18, noise: 0.14, hiss: 260 },
    intro: {
      e: 'On entre <b>dans un os</b>. Surprise : ce n’est pas plein ! C’est une dentelle très solide, et à l’intérieur, une usine fabrique tes globules rouges.',
      a: 'Os spongieux : un réseau de <b>travées</b> orientées selon les contraintes. Dans les espaces, la moelle hématopoïétique ; à droite, les faisceaux musculaires.',
    },
    card: {
      e: {
        kicker: 'Escale 9', title: 'Vivants, et bien vivants',
        html: `<p>On croit souvent que les os sont des cailloux secs. Faux : ils sont <b>vivants</b>, traversés de vaisseaux et de nerfs, et ils se réparent tout seuls.</p>
               <p>À l’intérieur, ce n’est pas plein mais construit comme une <em>tour Eiffel miniature</em> : léger et très résistant. Et dans les trous, la moelle fabrique <b>2 millions de globules rouges par seconde</b>.</p>
               <p>À côté, les muscles. Ils ne poussent jamais : ils ne savent que <b>tirer</b>. C’est pour ça qu’ils marchent par paires — un pour plier, un pour déplier.</p>`,
        stats: [['206 os', 'chez l’adulte… mais 270 à la naissance'],
                ['2 millions/s', 'de globules rouges fabriqués'],
                ['600', 'muscles environ dans ton corps'],
                ['10 ans', 'pour renouveler tout ton squelette']],
      },
      a: {
        kicker: 'Escale 9', title: 'Matériau composite et moteur chimique',
        html: `<p>L’os est un <b>composite</b> : une trame de collagène I qui encaisse la traction, minéralisée d’hydroxyapatite qui encaisse la compression. L’os spongieux organise ses travées selon les lignes de contrainte — la <em>loi de Wolff</em> : la forme suit la fonction.</p>
               <p>Il est en remodelage permanent : les <b>ostéoclastes</b> résorbent, les <b>ostéoblastes</b> reconstruisent, les ostéocytes emprisonnés détectent les contraintes et pilotent le processus. Le squelette entier se renouvelle en une dizaine d’années, et il constitue la réserve de calcium de l’organisme.</p>
               <p>Le muscle strié squelettique, lui, convertit l’ATP en travail mécanique : les têtes de <b>myosine</b> tirent sur les filaments d’<b>actine</b> qui glissent les uns sur les autres, raccourcissant le sarcomère. Aucun muscle ne pousse — d’où les couples agoniste/antagoniste.</p>`,
        stats: [['206', 'os chez l’adulte'],
                ['≈ 2 µm', 'longueur d’un sarcomère au repos'],
                ['30–40 %', 'de la masse corporelle : le muscle'],
                ['10 ans', 'renouvellement complet du squelette']],
      },
    },
    spots: {
      travee: {
        label: { e: 'La dentelle', a: 'Travées osseuses' },
        e: { title: 'Léger et costaud', html: `<p>Ces petites poutres ne sont pas placées au hasard : elles suivent exactement les directions où l’os est <b>poussé et tiré</b>. Le maximum de solidité avec le minimum de matière.</p>` },
        a: { title: 'Travées osseuses', html: `<p>Réseau tridimensionnel dont l’orientation épouse les contraintes principales. Une ostéoporose ne « creuse » pas l’os au hasard : elle <b>amincit puis rompt</b> les travées, effondrant la résistance bien plus vite que la seule perte de masse ne le laisserait croire.</p>` },
      },
      moelle: {
        label: { e: 'La moelle', a: 'Moelle hématopoïétique' },
        e: { title: 'L’usine à cellules', html: `<p>Une usine qui tourne <b>jour et nuit</b> : deux millions de globules rouges fabriqués chaque seconde, plus les globules blancs et les plaquettes.</p>` },
        a: { title: 'Moelle rouge', html: `<p>Siège de l’<b>hématopoïèse</b> : toutes les lignées sanguines dérivent d’une même cellule souche hématopoïétique. Production estimée à 2×10⁶ hématies/seconde, ajustée par l’érythropoïétine rénale. Chez l’adulte, elle se limite aux os plats et aux épiphyses.</p>` },
      },
      fibre: {
        label: { e: 'La fibre', a: 'Fibre musculaire' },
        e: { title: 'Des élastiques qui tirent', html: `<p>Chaque fibre est bourrée de fils qui <b>glissent</b> les uns sur les autres. Des millions de tout petits mouvements, tous ensemble, et le muscle raccourcit.</p>` },
        a: { title: 'Fibre musculaire', html: `<p>Syncytium plurinucléé pouvant atteindre plusieurs centimètres. Les stries proviennent de l’alignement des <b>sarcomères</b>. La contraction suit la théorie des filaments glissants : cycles attachement-pivotement-détachement des têtes de myosine, à raison de plusieurs ATP par cycle.</p>` },
      },
      jonction: {
        label: { e: 'Le fil du nerf', a: 'Jonction neuromusculaire' },
        e: { title: 'L’ordre de bouger', html: `<p>Un nerf arrive et dépose un <b>message chimique</b> sur le muscle. En quelques millièmes de seconde, la fibre se contracte. C’est ce qui se passe quand tu décides de bouger le doigt.</p>` },
        a: { title: 'Jonction neuromusculaire', html: `<p>Synapse à très haut coefficient de sécurité : l’<b>acétylcholine</b> libérée par le motoneurone ouvre les récepteurs nicotiniques et déclenche à coup sûr un potentiel d’action musculaire. Cible des curares et de la <em>myasthénie</em>.</p>` },
      },
    },
    quiz: {
      e: { q: 'Que fabrique la moelle à l’intérieur des os ?', opts: ['Les cellules du sang', 'Du calcium liquide', 'De la graisse uniquement'], ok: 0,
           fb: 'Exact : <b>2 millions de globules rouges par seconde</b>, plus les globules blancs et les plaquettes.' },
      a: { q: 'Selon la loi de Wolff, l’architecture trabéculaire s’oriente selon…', opts: ['Les contraintes mécaniques', 'Le réseau vasculaire', 'L’âge du sujet'], ok: 0,
           fb: 'Selon les <b>contraintes</b>. L’os est un tissu adaptatif : il se réorganise en fonction des charges qu’il subit.' },
    },
  },

  /* ══════════════════ 10 ══════════════════ */
  {
    id: 'cerveau', accent: '#a98cff', map: [50, 20],
    name: { e: 'Le cerveau', a: 'Le cerveau' },
    sub: { e: 'La forêt électrique', a: 'Réseau neuronal · synapse' },
    fog: { color: 0x0b0a22, density: 0.0011 },
    ambience: { base: 66, cutoff: 900, drone: 0.14, noise: 0.12, hiss: 1600 },
    intro: {
      e: 'Regarde ces éclairs ! Chaque trait de lumière est une <b>pensée</b> qui passe. Nous sommes dans le cerveau, au milieu de milliards de neurones.',
      a: 'Réseau cortical. Chaque impulsion lumineuse figure un <b>potentiel d’action</b> ; aux points de contact, les synapses convertissent l’électrique en chimique.',
    },
    card: {
      e: {
        kicker: 'Escale 10', title: '86 milliards de bavards',
        html: `<p>Ton cerveau contient <b>86 milliards de neurones</b>. Chacun est branché à des milliers d’autres : ça fait plus de connexions qu’il n’y a d’étoiles dans notre galaxie.</p>
               <p>Ils se parlent avec de <em>l’électricité</em> qui file le long de leurs bras, puis avec de <em>petits messages chimiques</em> pour sauter d’un neurone à l’autre.</p>
               <p>Et quand tu apprends quelque chose, ces connexions <b>changent vraiment</b> : certaines se renforcent, d’autres disparaissent. Apprendre, c’est modifier son cerveau.</p>`,
        stats: [['86 milliards', 'de neurones'],
                ['360 km/h', 'la vitesse des messages les plus rapides'],
                ['20 %', 'de ton énergie, pour 2 % de ton poids'],
                ['1,3 kg', 'et il ne se repose jamais']],
      },
      a: {
        kicker: 'Escale 10', title: 'Le réseau le plus dense connu',
        html: `<p><b>86 milliards de neurones</b>, autant de cellules gliales, et de l’ordre de <b>10¹⁴ synapses</b>. Pour 2 % de la masse corporelle, le cerveau consomme 20 % de l’oxygène et du glucose — sans réserve énergétique propre, d’où sa vulnérabilité à l’ischémie.</p>
               <p>Le <b>potentiel d’action</b> est un phénomène tout-ou-rien : dépolarisation par entrée de Na⁺, repolarisation par sortie de K⁺. Sur les axones myélinisés, la conduction est <em>saltatoire</em> — le signal saute d’un nœud de Ranvier à l’autre — et atteint 100 m/s contre moins de 1 m/s sans myéline.</p>
               <p>À la synapse, le message devient chimique : les vésicules libèrent leur neurotransmetteur dans une fente de 20 à 40 nm. L’efficacité de ce contact se modifie avec l’usage : c’est la <b>plasticité synaptique</b>, substrat de la mémoire.</p>`,
        stats: [['≈ 10¹⁴', 'synapses'],
                ['0,5–120 m/s', 'vitesse de conduction selon la fibre'],
                ['20–40 nm', 'largeur de la fente synaptique'],
                ['1 ms', 'délai synaptique']],
      },
    },
    spots: {
      neurone: {
        label: { e: 'Un neurone', a: 'Neurone' },
        e: { title: 'L’arbre qui pense', html: `<p>Il a des <b>branches</b> pour écouter, un corps pour décider, et un <b>long fil</b> pour transmettre. Certains de ces fils descendent jusqu’à ton pied — presque un mètre !</p>` },
        a: { title: 'Neurone', html: `<p>Dendrites (réception), soma (intégration), axone (conduction). L’intégration est <b>spatio-temporelle</b> : le potentiel d’action ne part que si la somme des entrées franchit le seuil au cône d’émergence. Certains axones dépassent un mètre.</p>` },
      },
      synapse: {
        label: { e: 'Le saut', a: 'Synapse' },
        e: { title: 'Le petit saut chimique', html: `<p>Les neurones ne se touchent pas ! Il reste un espace minuscule. Pour le franchir, le message se transforme en <b>gouttelettes chimiques</b> qui traversent et vont sonner à la porte d’en face.</p>` },
        a: { title: 'Synapse chimique', html: `<p>L’entrée de Ca²⁺ déclenche l’exocytose des vésicules ; le neurotransmetteur diffuse et se fixe sur les récepteurs post-synaptiques. Cette étape est <b>modifiable</b> — potentialisation à long terme, dépression à long terme — et coûte l’essentiel de l’énergie cérébrale.</p>` },
      },
      myeline: {
        label: { e: 'La gaine', a: 'Myéline' },
        e: { title: 'L’accélérateur', html: `<p>Une gaine grasse entoure le fil, avec des trous réguliers. Le signal <b>saute</b> de trou en trou au lieu de ramper : il va cent fois plus vite.</p>` },
        a: { title: 'Myéline', html: `<p>Enroulements membranaires d’oligodendrocytes isolant l’axone, interrompus aux <b>nœuds de Ranvier</b> où se concentrent les canaux sodiques. La conduction saltatoire économise énergie et espace. Sa destruction auto-immune définit la <em>sclérose en plaques</em>.</p>` },
      },
      glie: {
        label: { e: 'Les aides', a: 'Astrocytes' },
        e: { title: 'Les nourrices', html: `<p>Autour des neurones vivent d’autres cellules qui les <b>nourrissent</b>, font le ménage et règlent la circulation du sang là où le cerveau travaille.</p>` },
        a: { title: 'Astrocytes', html: `<p>Ils tamponnent le K⁺ extracellulaire, recyclent le glutamate, alimentent les neurones en lactate et participent à la <b>barrière hémato-encéphalique</b>. Leurs pieds péri-vasculaires couplent activité neuronale et débit sanguin local — le signal même que mesure l’IRM fonctionnelle.</p>` },
      },
    },
    quiz: {
      e: { q: 'Comment un message passe-t-il d’un neurone à l’autre ?', opts: ['Par de petites gouttes chimiques', 'Par une étincelle qui saute', 'Ils se touchent et se collent'], ok: 0,
           fb: 'Oui ! Un espace minuscule sépare les neurones : le message le franchit sous forme <b>chimique</b>.' },
      a: { q: 'Que permet la myélinisation d’un axone ?', opts: ['Une conduction saltatoire plus rapide', 'Une amplitude de potentiel plus grande', 'Une synthèse accrue de neurotransmetteurs'], ok: 0,
           fb: 'La <b>conduction saltatoire</b> de nœud en nœud : jusqu’à 120 m/s, pour un coût énergétique moindre.' },
    },
  },

  /* ══════════════════ 11 ══════════════════ */
  {
    id: 'cellule', accent: '#5fe0c8', map: [50, 140],
    name: { e: 'La cellule', a: 'La cellule et l’ADN' },
    sub: { e: 'Le monde secret', a: 'Cytoplasme · noyau · double hélice' },
    fog: { color: 0x061a1c, density: 0.0012 },
    ambience: { base: 72, cutoff: 1100, drone: 0.12, noise: 0.1, hiss: 2000 },
    intro: {
      e: 'Dernière escale, la plus petite… et la plus incroyable. Nous entrons <b>dans une seule cellule</b>. Devant nous, son coffre-fort : le noyau.',
      a: 'Échelle micrométrique : cytoplasme, mitochondries, réticulum. Au centre, le <b>noyau</b> et ses deux mètres d’ADN compactés dans six microns.',
    },
    card: {
      e: {
        kicker: 'Escale 11', title: 'Deux mètres de plan dans une bille invisible',
        html: `<p>Ton corps est fait d’environ <b>trente mille milliards</b> de cellules. Chacune est une petite ville : des centrales, des usines, des routes, et une bibliothèque centrale.</p>
               <p>Dans le noyau se trouve ton <b>ADN</b> : une échelle en spirale qui, dépliée, mesurerait <em>deux mètres</em>. Et pourtant elle tient dans quelque chose d’invisible à l’œil nu.</p>
               <p>Cette échelle est le mode d’emploi complet pour te fabriquer. Et il y en a une copie <b>dans presque chacune</b> de tes cellules.</p>`,
        stats: [['30 000 milliards', 'de cellules dans ton corps'],
                ['2 mètres', 'd’ADN plié dans chaque noyau'],
                ['3,2 milliards', 'de « lettres » dans ton mode d’emploi'],
                ['99,9 %', 'd’ADN identique à celui de ton voisin']],
      },
      a: {
        kicker: 'Escale 11', title: 'L’unité du vivant',
        html: `<p>On estime le corps humain à <b>3×10¹³ cellules</b>, auxquelles s’ajoute un nombre comparable de bactéries. Chacune abrite le même génome, mais n’en exprime qu’une fraction : c’est la <em>différenciation</em>.</p>
               <p>Le noyau contient <b>2 mètres d’ADN</b> répartis en 23 paires de chromosomes, compactés d’un facteur 10 000 par enroulement autour des histones. Sur 3,2 milliards de paires de bases, à peine 20 000 gènes codants — l’essentiel du génome est régulateur.</p>
               <p>Autour, les organites : <b>mitochondries</b> issues d’une endosymbiose ancienne, avec leur ADN circulaire propre, produisant l’ATP par phosphorylation oxydative ; réticulum endoplasmique et Golgi pour la synthèse et l’adressage ; ribosomes traduisant l’ARN messager en protéines à une dizaine d’acides aminés par seconde.</p>`,
        stats: [['≈ 3×10¹³', 'cellules'],
                ['23 paires', 'de chromosomes'],
                ['≈ 20 000', 'gènes codant des protéines'],
                ['10¹⁷', 'molécules d’ATP consommées par seconde']],
      },
    },
    spots: {
      noyau: {
        label: { e: 'Le coffre-fort', a: 'Noyau' },
        e: { title: 'La bibliothèque', html: `<p>Le noyau protège le plan de fabrication. Rien n’en sort directement : la cellule en fait des <b>photocopies</b> qu’elle envoie travailler dehors.</p>` },
        a: { title: 'Noyau', html: `<p>Délimité par une double membrane percée de <b>pores nucléaires</b> assurant un transport sélectif. Le nucléole y assemble les ribosomes. La séparation transcription/traduction, propre aux eucaryotes, autorise la <em>maturation des ARN</em> et l’épissage alternatif.</p>` },
      },
      adn: {
        label: { e: 'L’ADN', a: 'Double hélice' },
        e: { title: 'L’échelle en spirale', html: `<p>Une échelle tordue dont les barreaux ne se combinent que par paires : <b>A avec T</b>, <b>C avec G</b>. Toujours. C’est ce qui permet de la copier sans erreur.</p>` },
        a: { title: 'ADN', html: `<p>Double hélice antiparallèle, un tour par 10,5 paires de bases. La complémentarité A–T / C–G rend chaque brin <b>matrice</b> de l’autre : la réplication est semi-conservative, avec un taux d’erreur résiduel d’environ 10⁻⁹ après relecture et réparation.</p>` },
      },
      mito: {
        label: { e: 'Les centrales', a: 'Mitochondries' },
        e: { title: 'Les piles de la cellule', html: `<p>Ces haricots fabriquent l’<b>énergie</b>. Plus une cellule travaille, plus elle en contient : une cellule de cœur en est bourrée.</p>` },
        a: { title: 'Mitochondrie', html: `<p>Organite à double membrane, la membrane interne repliée en <b>crêtes</b> qui portent la chaîne respiratoire. Elle possède son propre ADN circulaire, de <em>transmission strictement maternelle</em> — trace de son origine bactérienne.</p>` },
      },
      ribosome: {
        label: { e: 'Les ateliers', a: 'Ribosomes' },
        e: { title: 'Les assembleurs', html: `<p>Ils lisent la photocopie du plan et assemblent les <b>protéines</b>, morceau par morceau, comme on enfile des perles — plusieurs par seconde.</p>` },
        a: { title: 'Ribosome', html: `<p>Complexe ribonucléoprotéique lisant l’ARNm codon par codon et catalysant la liaison peptidique. Vitesse : ~10 acides aminés/s. Sa spécificité bactérienne en fait la cible de nombreux <b>antibiotiques</b> — macrolides, aminosides, cyclines.</p>` },
      },
    },
    quiz: {
      e: { q: 'Quelle longueur d’ADN se cache dans une seule de tes cellules ?', opts: ['Environ 2 mètres', 'Environ 2 millimètres', 'Environ 2 kilomètres'], ok: 0,
           fb: '<b>Deux mètres</b>, pliés dans un noyau de quelques millièmes de millimètre. Un chef-d’œuvre de rangement.' },
      a: { q: 'Pourquoi l’ADN mitochondrial est-il de transmission maternelle ?', opts: ['Les mitochondries de l’ovocyte sont seules conservées', 'Il est porté par le chromosome X', 'Il est recopié depuis l’ADN nucléaire'], ok: 0,
           fb: 'Les mitochondries paternelles sont éliminées après la fécondation : seul le stock <b>ovocytaire</b> persiste.' },
    },
  },
];

/* Petit sélecteur bilingue : t({e,a}, age). */
export const t = (obj, age) => (obj == null ? '' : (typeof obj === 'string' ? obj : (obj[age === 'enfant' ? 'e' : 'a'] ?? obj.a ?? obj.e ?? '')));

export const FINALE = {
  e: {
    title: 'Voyage terminé !',
    html: `<p>Tu viens de traverser <b>onze mondes</b> — et tout ça se trouve à l’intérieur de toi, en ce moment même.</p>
           <p>Pendant que tu lisais cette phrase, ton cœur a battu, tes poumons ont pris de l’air, ta moelle a fabriqué <em>des millions</em> de globules rouges et des milliards de neurones se sont parlé.</p>
           <p>Sans que tu aies rien eu à faire.</p>`,
  },
  a: {
    title: 'Fin du parcours',
    html: `<p>Onze escales, de la barrière cornée à la double hélice : six ordres de grandeur parcourus, du mètre au nanomètre.</p>
           <p>Le plus remarquable n’est pas chaque organe pris isolément, mais leur <b>couplage</b> — un rein qui règle la pression, une moelle qui répond à un signal rénal, un foie qui alimente un cerveau incapable de stocker son carburant.</p>
           <p>Un état stationnaire maintenu à chaque instant, sans commande centrale et sans interruption.</p>`,
  },
};
