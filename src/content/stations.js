/**
 * Le contenu du voyage.
 *
 * Chaque escale existe en deux écritures :
 *   e — version enfant, dès 7 ans : images concrètes, comparaisons, tutoiement
 *   a — version adulte
 *
 * Trois règles d'écriture, tenues partout :
 *   1. Aucun terme technique qui ne soit traduit dans la phrase même.
 *   2. Une image concrète en ouverture, puis ce que ça change pour le lecteur :
 *      l'essoufflement, la gueule de bois, la crampe, l'urine foncée.
 *   3. Des phrases droites. Pas de tirets d'incise, pas d'apartés empilés.
 *      Quand une idée mérite d'être isolée, elle prend un point.
 *
 * Le champ `link` est la phrase du carton de chapitre : elle dit pourquoi cette
 * escale vient là dans le voyage. Mises bout à bout, les onze phrases racontent
 * le trajet complet, et c'est ça, l'histoire.
 *
 * Les positions 3D des repères vivent dans src/world/*.js, appariées par leur
 * clé. Les missions sont dans content/missions.js.
 */

export const STATIONS = [
  /* ══════════════════ 1 ══════════════════ */
  {
    id: 'peau', accent: '#ffb38a', map: [88, 58],
    name: { e: 'La peau', a: 'La peau' },
    sub: { e: 'Le sas d’entrée', a: 'La frontière du corps' },
    fog: { color: 0x9a6144, density: 0.0011 },
    link: {
      e: 'On commence dehors. Pour entrer dans un corps, il faut d’abord trouver une porte, et la peau n’en a pas beaucoup.',
      a: 'Le voyage commence à l’extérieur. Avant d’entrer, il faut franchir la seule chose qui sépare vraiment un corps du reste du monde.',
    },
    intro: {
      e: 'Bienvenue à bord. On rétrécit, et on se pose sur ta <b>peau</b>. Vue d’ici, elle ressemble à un désert de dalles, avec des poils hauts comme des arbres.',
      a: 'Nous voici posés sur votre peau, agrandie environ mille fois. Ces dalles craquelées sont des cellules mortes. Le puits, devant nous, est un pore. C’est par là que nous entrerons.',
    },
    card: {
      e: {
        kicker: 'Escale 1', title: 'Un manteau vivant',
        html: `<p>La peau est le <b>plus grand organe</b> de ton corps. Étalée, elle couvrirait presque une porte : environ deux mètres carrés.</p>
               <p>Ces dalles sous nos pieds sont des <em>cellules mortes</em>, aplaties et posées comme les tuiles d’un toit. Elles empêchent l’eau de sortir et les microbes d’entrer. En dessous, des cellules toutes neuves poussent sans arrêt et remontent vers la surface.</p>
               <p>Résultat : <b>tu changes de peau tous les mois</b> sans même t’en apercevoir.</p>`,
        stats: [['≈ 2 m²', 'la surface de ta peau, à peu près une porte'],
                ['1 mois', 'pour fabriquer une peau entièrement neuve'],
                ['40 000', 'cellules mortes perdues chaque minute'],
                ['5 mm', 'l’épaisseur sous le talon, contre 0,5 mm sur la paupière']],
      },
      a: {
        kicker: 'Escale 1', title: 'Vous êtes mort en surface',
        html: `<p>Ce que vous touchez quand vous vous touchez le bras, c’est du tissu mort. La quinzaine de couches les plus externes sont des cellules vidées de tout, aplaties, remplies d’une protéine dure et collées entre elles par un ciment gras. Des briques et du mortier : le modèle porte ce nom.</p>
               <p>C’est ce mur de deux centièmes de millimètre qui vous garde étanche. Sans lui, vous vous videriez de votre eau en quelques heures. C’est aussi lui qui décide si une crème pénètre ou reste dessus. La plupart restent dessus.</p>
               <p>Dessous, une couche de cellules fabrique en continu des remplaçantes, qui montent vers la surface en durcissant. Le trajet complet dure <b>quatre semaines</b>. Votre peau d’aujourd’hui n’existait pas le mois dernier.</p>
               <p>Et si vos doigts se fripent dans le bain, ce n’est pas parce qu’ils gonflent. C’est le système nerveux qui resserre les vaisseaux sous la pulpe. Un réflexe, probablement pour mieux agripper le mouillé.</p>`,
        stats: [['1,5 à 2 m²', 'la surface totale, environ une porte'],
                ['4 semaines', 'pour renouveler entièrement l’épiderme'],
                ['2 à 5 millions', 'de glandes à sueur'],
                ['0,05 à 5 mm', 'de la paupière à la plante du pied']],
      },
    },
    spots: {
      poil: {
        label: { e: 'Un poil', a: 'Un poil' },
        e: { title: 'L’arbre de la peau', html: `<p>Un poil, c’est de la <b>kératine</b>, la même matière que tes ongles. Il pousse depuis une petite poche enfoncée dans la peau. Un minuscule muscle est accroché à cette poche, et quand tu as froid il redresse le poil : c’est la <em>chair de poule</em>.</p>` },
        a: { title: 'Un poil', html: `<p>Une tige morte, poussée par une poche vivante enfoncée dans la peau. Un minuscule muscle y est attaché. Quand il se contracte, le poil se dresse et la peau se hérisse. C’est la chair de poule, un réflexe qui gonflait la fourrure de nos ancêtres et qui, sur nous, ne sert plus à rien.</p>
                                      <p>La poche produit aussi le <b>sébum</b>, ce gras qui rend les cheveux gras au bout de trois jours. En excès, il bouche le pore, et ça donne le point noir.</p>` },
      },
      pore: {
        label: { e: 'Le tunnel', a: 'Un pore' },
        e: { title: 'La porte d’entrée', html: `<p>Ce puits est un <b>pore</b> : le trou par lequel sort la sueur. C’est aussi notre entrée. Quand tu as chaud, des millions de petites glandes envoient de l’eau ici pour te refroidir.</p>` },
        a: { title: 'Un pore', html: `<p>La sortie d’une glande à sueur. C’est votre principal moyen de ne pas surchauffer : en s’évaporant, l’eau emporte de la chaleur. À l’effort et par forte chaleur, on peut en évacuer <b>un à deux litres par heure</b>. D’où la déshydratation express quand on ne boit pas.</p>
                                     <p>Le mélange de sueur et de gras qui reste en surface est légèrement acide, ce qui gêne la plupart des bactéries. Se laver trop agressivement l’élimine, et la peau tire.</p>` },
      },
      corne: {
        label: { e: 'Les dalles', a: 'La couche morte' },
        e: { title: 'Des tuiles vivantes', html: `<p>Chaque dalle est une cellule <b>morte</b> et aplatie. Elle a fait tout un voyage : née tout en bas, elle a mis un mois pour monter jusqu’ici. Puis elle s’envolera en poussière.</p>` },
        a: { title: 'La couche morte', html: `<p>Chaque dalle est une cellule qui a passé un mois à monter et qui, arrivée ici, s’est vidée de son noyau pour ne garder que de la kératine. Elle tiendra encore une quinzaine de jours, puis se détachera.</p>
                                              <p>Vous en perdez environ <b>40 000 par minute</b>. C’est l’essentiel de la poussière de votre logement. Et c’est ce que retire un gommage : rien de vivant, juste ce qui allait tomber.</p>` },
      },
    },
    quiz: {
      e: { q: 'En combien de temps ta peau se renouvelle-t-elle entièrement ?', opts: ['En un mois environ', 'En un an', 'Jamais : c’est la même toute la vie'], ok: 0,
           fb: 'Oui ! <b>Environ 28 jours.</b> Tu portes une peau plus jeune que ton dernier anniversaire.' },
      a: { q: 'Pourquoi vos doigts se fripent-ils dans le bain ?', opts: ['Les vaisseaux se resserrent sous la peau', 'La peau absorbe de l’eau et gonfle', 'Le savon dissout le gras de surface'], ok: 0,
           fb: 'Ce n’est pas un gonflement mais un <b>réflexe nerveux</b> : les vaisseaux se contractent et la pulpe se plisse. On soupçonne un meilleur agrippement sur le mouillé, car les doigts anesthésiés ne se fripent pas.' },
    },
  },

  /* ══════════════════ 2 ══════════════════ */
  {
    id: 'sang', accent: '#ff5a6e', map: [76, 118],
    name: { e: 'La rivière rouge', a: 'L’artère' },
    sub: { e: 'Dans le sang', a: 'Le fleuve sous pression' },
    fog: { color: 0x2a0409, density: 0.0105 },
    link: {
      e: 'Sous le pore passe un tuyau rouge. On s’y laisse tomber : à partir d’ici, c’est le courant qui nous emmène.',
      a: 'Sous le pore passe un vaisseau. C’est le réseau de transport du corps, et le seul moyen d’aller partout ailleurs. On s’y engage à contre-courant.',
    },
    intro: {
      e: 'Nous voilà dans un <b>vaisseau sanguin</b>, un tunnel rouge où tout file à toute vitesse. Ces galettes rouges autour de nous transportent l’oxygène.',
      a: 'Nous remontons une <b>artère</b> à contre-courant. Ces disques rouges portent l’oxygène. Le grondement que vous entendez vient du cœur, en amont. Plus on s’en approche, plus il domine.',
    },
    card: {
      e: {
        kicker: 'Escale 2', title: 'Cinq litres qui n’arrêtent jamais',
        html: `<p>Le sang, c’est le <b>service de livraison</b> du corps. Il apporte l’oxygène et la nourriture partout, et repart avec les déchets.</p>
               <p>Les galettes rouges sont les <em>globules rouges</em>, de vrais camions à oxygène. Il y en a tellement que, mis bout à bout, ils feraient plusieurs fois le tour de la Terre.</p>
               <p>Et tout ce réseau de tuyaux, mis bout à bout, mesurerait <b>100 000 kilomètres</b>. Deux fois et demie le tour du monde, dans une seule personne.</p>`,
        stats: [['5 litres', 'de sang chez un adulte'],
                ['100 000 km', 'de vaisseaux bout à bout'],
                ['≈ 1 minute', 'pour faire un tour complet du corps'],
                ['120 jours', 'la vie d’un globule rouge']],
      },
      a: {
        kicker: 'Escale 2', title: 'Un tuyau qui rend le débit régulier',
        html: `<p>Cinq litres. C’est tout ce que vous avez, et ça fait le tour complet du corps en une minute environ.</p>
               <p>Le cœur ne pousse pas en continu, il envoie des coups. Si les artères étaient des tuyaux rigides, vos plus petits vaisseaux recevraient ces à-coups en pleine face et céderaient. Elles sont donc <b>élastiques</b>. Elles se dilatent au coup, se rétractent entre deux, et restituent le sang pendant la pause. Le débit qui arrive aux tissus est presque continu.</p>
               <p>Voilà ce que mesure un tensiomètre. Le premier chiffre, c’est la poussée. Le second, ce qui reste entre deux coups grâce à cette élasticité. Avec l’âge les artères durcissent, l’amortisseur fonctionne moins bien, et le premier chiffre monte.</p>
               <p>Un détail d’échelle. Dans l’aorte, le sang file à <b>40 cm par seconde</b>. Dans le plus fin des vaisseaux, à moins d’un millimètre par seconde. Ce ralentissement n’est pas un défaut : c’est le temps qu’il faut pour livrer.</p>`,
        stats: [['≈ 5 litres', 'chez un adulte, soit 7 % du poids'],
                ['5 millions', 'de globules rouges par millimètre cube'],
                ['100 000 km', 'de vaisseaux bout à bout'],
                ['40 cm/s', 'la vitesse dans l’aorte, au moment du coup']],
      },
    },
    spots: {
      hematie: {
        label: { e: 'Globule rouge', a: 'Globule rouge' },
        e: { title: 'Le camion à oxygène', html: `<p>Creux des deux côtés comme un coussin dégonflé, il se plie pour passer dans les tuyaux les plus étroits. Il ne vit que <b>4 mois</b>, puis il est recyclé. Ton corps en fabrique <em>2 millions par seconde</em>.</p>` },
        a: { title: 'Globule rouge', html: `<p>Un disque creux des deux côtés, de sept millièmes de millimètre, si souple qu’il se plie en deux pour passer dans des vaisseaux plus étroits que lui.</p>
                                            <p>Il a jeté son noyau pour faire de la place. C’est donc une cellule sans plan, incapable de se réparer, et c’est ce qui limite sa vie à <b>120 jours</b>. Chacun transporte 270 millions de molécules d’hémoglobine, la protéine qui fixe l’oxygène. Elle est rouge, ce qui explique la couleur.</p>
                                            <p>Vous en fabriquez deux millions par seconde. Le fer sert exactement à ça. Sans fer, pas d’hémoglobine, et l’essoufflement au moindre escalier.</p>` },
      },
      leuco: {
        label: { e: 'Globule blanc', a: 'Globule blanc' },
        e: { title: 'Le garde du corps', html: `<p>Plus gros et plus rare, il patrouille. S’il repère un microbe, il le poursuit, l’avale et le digère. Certains gardent même <b>le souvenir</b> des intrus déjà rencontrés.</p>` },
        a: { title: 'Globule blanc', html: `<p>Mille fois moins nombreux que les rouges, et bien plus gros. Certains avalent et digèrent les bactéries sur place. D’autres gardent la <b>mémoire</b> de ce qu’ils ont rencontré, et c’est exactement ce qu’exploite un vaccin.</p>
                                            <p>Ils ne restent pas dans le sang. Le vaisseau n’est qu’une autoroute. Arrivés en face d’un tissu enflammé, ils ralentissent, roulent le long de la paroi, puis se faufilent entre deux cellules pour sortir. Le pus, c’est eux, morts au travail.</p>` },
      },
      plaquette: {
        label: { e: 'Plaquettes', a: 'Plaquettes' },
        e: { title: 'Le pansement de poche', html: `<p>Ces petits éclats se collent instantanément sur une déchirure et forment un bouchon. Sans eux, la moindre coupure ne s’arrêterait jamais.</p>` },
        a: { title: 'Plaquettes', html: `<p>Ce ne sont pas des cellules entières, mais des éclats détachés de cellules géantes restées dans la moelle. Dès qu’une paroi est déchirée, elles s’y collent, changent de forme, s’agglutinent et bouchent le trou en quelques secondes. Un maillage de fibres vient ensuite consolider, et ça donne la croûte.</p>
                                         <p>L’aspirine agit précisément là, en les rendant moins collantes. C’est pourquoi on saigne un peu plus longtemps sous aspirine, et pourquoi on en donne à faible dose après un infarctus.</p>` },
      },
      paroi: {
        label: { e: 'La paroi', a: 'La paroi du vaisseau' },
        e: { title: 'Le tapis vivant', html: `<p>Le tunnel n’est pas un tuyau mort. Sa surface est faite de cellules bien rangées, lisses comme du carrelage, pour que le sang glisse sans accrocher.</p>` },
        a: { title: 'La paroi du vaisseau', html: `<p>La surface intérieure est un tapis d’une seule épaisseur de cellules, jointives comme du carrelage et toutes allongées dans le sens du courant. Mises bout à bout dans un corps entier, elles couvriraient <b>700 m²</b>.</p>
                                                   <p>Ce tapis n’est pas passif. Il commande le diamètre du vaisseau, empêche le sang de coaguler contre lui, et décide où les globules blancs ont le droit de sortir. Quand il s’abîme, sous l’effet du tabac, du sucre ou de la tension, du gras s’infiltre dessous et la plaque commence à se former. Tout l’infarctus part de là.</p>` },
      },
    },
    quiz: {
      e: { q: 'Combien de kilomètres de vaisseaux as-tu dans le corps ?', opts: ['100 000 km', '500 km', '12 km'], ok: 0,
           fb: 'Incroyable mais vrai : <b>100 000 km</b>, soit deux fois et demie le tour de la Terre.' },
      a: { q: 'Pourquoi les artères sont-elles élastiques plutôt que rigides ?', opts: ['Pour lisser les à-coups du cœur', 'Pour accélérer le sang', 'Pour filtrer les grosses cellules'], ok: 0,
           fb: 'Elles se gonflent au coup de pompe et se rétractent entre deux, si bien que les tissus reçoivent un débit presque continu. Quand elles <b>durcissent avec l’âge</b>, cet amortisseur fonctionne moins bien et la tension monte.' },
    },
  },

  /* ══════════════════ 3 ══════════════════ */
  {
    id: 'coeur', accent: '#e8384f', map: [50, 62],
    name: { e: 'Le cœur', a: 'Le cœur' },
    sub: { e: 'La grande pompe', a: 'La pompe qui commande tout' },
    fog: { color: 0x33050c, density: 0.0026 },
    link: {
      e: 'On remonte le courant. Quand on remonte une rivière assez longtemps, on finit toujours par trouver la source.',
      a: 'En remontant le courant, on ne peut arriver qu’à un seul endroit. Tout ce qui circule dans le corps est passé par cette pièce, il y a moins d’une minute.',
    },
    intro: {
      e: 'Attention, ça secoue ! Nous sommes <b>à l’intérieur du cœur</b>. Ces murs qui bougent sont des muscles. Au-dessus de nous, deux grandes portes s’ouvrent chacune à leur tour.',
      a: 'Nous sommes dans la <b>chambre gauche</b>, celle qui envoie le sang dans tout le corps. Le mur qui bouge autour de vous fait plus d’un centimètre de muscle. Au plafond, deux portes : l’entrée à gauche, la sortie à droite.',
    },
    card: {
      e: {
        kicker: 'Escale 3', title: 'La pompe qui ne dort jamais',
        html: `<p>Ton cœur est un <b>muscle creux</b>, à peu près de la taille de ton poing. Il a quatre pièces : deux en haut, deux en bas.</p>
               <p>À chaque battement il se serre d’un coup et propulse le sang. Les portes entre les pièces claquent en se fermant, et c’est ce <em>boum-boum</em> qu’on entend avec un stéthoscope.</p>
               <p>Il bat environ <b>100 000 fois par jour</b>. Depuis ta naissance, il ne s’est jamais arrêté une seule seconde.</p>`,
        stats: [['100 000', 'battements par jour'],
                ['7 000 litres', 'de sang poussés chaque jour'],
                ['1 poing', 'sa taille, à peu près la tienne'],
                ['0 pause', 'depuis avant même ta naissance']],
      },
      a: {
        kicker: 'Escale 3', title: 'Deux pompes collées dos à dos',
        html: `<p>On dit « le cœur », mais il y en a deux, accolés. Celle de droite envoie le sang aux poumons, juste à côté : court trajet, faible pression, mur mince. Celle de gauche, où vous êtes, l’envoie dans tout le reste, jusqu’aux orteils. D’où un mur trois fois plus épais.</p>
               <p>Regardez le plafond. Chaque chambre a une porte d’entrée et une porte de sortie, et elles ne sont jamais ouvertes en même temps. La chambre se remplit par l’une, se contracte, et se vide par l’autre. C’est tout le mécanisme.</p>
               <p>Le rythme ne vient pas du cerveau. Un petit groupe de cellules, dans le coin supérieur droit, se dépolarise tout seul à intervalle régulier et impose le tempo. Un cœur retiré du corps continue de battre tant qu’on le nourrit, et c’est ce qui rend la greffe possible.</p>
               <p>Le <b>boum-boum</b> n’est pas le muscle, ce sont les valves qui claquent en se fermant. Un souffle au cœur, c’est une de ces valves qui ferme mal et laisse fuir un peu de sang à contresens.</p>
               <p>Le muscle cardiaque est bourré de centrales énergétiques et n’a aucune réserve. Bouchez l’artère qui le nourrit, et la zone privée meurt en une trentaine de minutes, définitivement. C’est l’infarctus, et c’est pour ça que chaque minute compte.</p>`,
        stats: [['5 litres/min', 'au repos, jusqu’à 25 à l’effort maximal'],
                ['70 mL', 'éjectés à chaque battement, un demi-verre'],
                ['0,8 seconde', 'la durée d’un cycle complet'],
                ['2 milliards', 'de battements sur une vie']],
      },
    },
    spots: {
      valve: {
        label: { e: 'La porte d’entrée', a: 'La valve d’entrée' },
        e: { title: 'Une porte à sens unique', html: `<p>Elle s’ouvre pour laisser entrer le sang, puis se referme d’un coup pour l’empêcher de repartir en arrière. C’est le premier <b>boum</b> du battement.</p>` },
        a: { title: 'La valve d’entrée', html: `<p>Deux voiles souples qui laissent entrer le sang, puis se plaquent l’un contre l’autre quand la chambre se contracte. Ce claquement est le premier <b>boum</b> que l’on entend au stéthoscope.</p>
                                                <p>Aucun mécanisme, aucun ressort. Ce sont les différences de pression qui les ouvrent et les ferment. Quand ces voiles s’épaississent ou se distendent avec l’âge, ils ferment mal, le sang reflue, et le cœur doit travailler davantage pour compenser.</p>` },
      },
      aorte: {
        label: { e: 'La porte de sortie', a: 'La valve de sortie' },
        e: { title: 'Trois petites poches', html: `<p>Trois poches en demi-lune, collées à la paroi. Quand le cœur pousse, elles s’écrasent sur les côtés et laissent tout passer. Quand il se relâche, le sang qui voudrait revenir les remplit, et elles se referment d’un coup. C’est le deuxième <b>boum</b>.</p>` },
        a: { title: 'La valve de sortie', html: `<p>Trois poches en demi-lune. Elles n’ont ni cordes ni piliers, et elles n’en ont pas besoin : c’est le sang qui voudrait refluer qui vient les remplir et les plaquer les unes contre les autres. Fermées, leurs trois bords libres dessinent un Y.</p>
                                                 <p>Ce claquement est le deuxième <b>boum</b> du battement, celui qui marque la fin de la contraction. Regardez-la faire pendant quelques cycles avec la porte d’entrée : quand l’une s’ouvre, l’autre se ferme. Elles ne sont jamais ouvertes ensemble, et c’est toute la raison pour laquelle le sang avance au lieu de faire des allers-retours.</p>
                                                 <p>Chez certaines personnes elle se calcifie avec l’âge et ne s’ouvre plus assez. Le cœur doit alors pousser à travers un passage rétréci, s’épaissit, et finit par s’essouffler. C’est l’une des opérations cardiaques les plus fréquentes après 70 ans.</p>` },
      },
      cordage: {
        label: { e: 'Les cordes', a: 'Les cordes de la valve' },
        e: { title: 'Les haubans de la porte', html: `<p>Ces filins retiennent la porte quand le sang pousse très fort, comme les cordes d’un parachute. Sans eux, elle se retournerait.</p>` },
        a: { title: 'Les cordes de la valve', html: `<p>Des filins tendus entre le bord des voiles et des piliers de muscle plantés au fond de la chambre. Ils ne ferment pas la valve. Ils <b>l’empêchent de se retourner</b> quand la pression monte, exactement comme les suspentes d’un parachute.</p>
                                                     <p>Quand l’un d’eux casse, le voile part en arrière et le sang reflue d’un coup dans la pièce d’au-dessus. C’est une urgence chirurgicale.</p>` },
      },
      myocarde: {
        label: { e: 'Le muscle', a: 'Le muscle cardiaque' },
        e: { title: 'Un muscle infatigable', html: `<p>Ce mur épais est un muscle très particulier : il se contracte <b>tout seul</b>, sans que tu y penses, et il ne se fatigue jamais. Il a même ses propres tuyaux pour se nourrir.</p>` },
        a: { title: 'Le muscle cardiaque', html: `<p>Ce n’est ni le muscle du biceps ni celui de l’intestin, mais un troisième type. Ses cellules sont soudées entre elles par des jonctions qui laissent passer le courant. Le signal électrique se propage donc de proche en proche, et la paroi entière se contracte d’un seul bloc. C’est l’onde claire que vous voyez descendre du plafond vers la pointe à chaque coup.</p>
                                                  <p>Un tiers du volume de ces cellules est occupé par des centrales énergétiques. Elles brûlent en permanence et ne stockent rien. Ce muscle a ses propres artères, les coronaires, et il est le seul du corps à ne jamais pouvoir se reposer.</p>` },
      },
      sinusal: {
        label: { e: 'Le chef d’orchestre', a: 'Le donneur de tempo' },
        e: { title: 'Qui donne le rythme ?', html: `<p>Un petit groupe de cellules envoie une <b>impulsion électrique</b> à chaque battement. C’est lui qui décide du tempo, et qui accélère quand tu cours.</p>` },
        a: { title: 'Le donneur de tempo', html: `<p>Un amas de quelques milliers de cellules qui se dépolarisent spontanément à intervalle régulier. Personne ne leur donne l’ordre : elles fuient lentement des ions jusqu’au déclenchement, et ça recommence. C’est de là que part l’onde qui traverse ensuite tout le muscle.</p>
                                                  <p>Les nerfs ne font que <b>moduler</b> ce tempo, l’accélérer sous adrénaline, le ralentir au repos. Quand ces cellules fatiguent, on implante un stimulateur qui prend le relais. Un pacemaker ne remplace pas le cœur, il remplace ce métronome.</p>` },
      },
    },
    quiz: {
      e: { q: 'Combien de fois ton cœur bat-il en une journée ?', opts: ['Environ 100 000 fois', 'Environ 1 000 fois', 'Environ 10 millions de fois'], ok: 0,
           fb: 'Bravo ! <b>Environ 100 000 battements</b> par jour, soit à peu près 70 par minute au repos.' },
      a: { q: 'Qu’entend-on exactement dans le « boum-boum » du cœur ?', opts: ['Les valves qui claquent en se fermant', 'Le muscle qui se contracte', 'Le sang qui frappe la paroi'], ok: 0,
           fb: 'Les <b>valves</b>. Le premier boum est la porte d’entrée qui se ferme, le second la porte de sortie. Un souffle au cœur, c’est une valve qui ferme mal : on entend le sang fuir à contresens entre deux claquements.' },
    },
  },

  /* ══════════════════ 4 ══════════════════ */
  {
    id: 'poumons', accent: '#7fd8ff', map: [66, 60],
    name: { e: 'Les poumons', a: 'Les poumons' },
    sub: { e: 'La forêt de bulles', a: 'Là où l’air passe dans le sang' },
    fog: { color: 0x1b2833, density: 0.0022 },
    link: {
      e: 'Le cœur nous envoie juste à côté, dans les poumons. C’est le seul endroit du corps où l’air et le sang se touchent presque.',
      a: 'La chambre droite du cœur envoie tout le sang à quelques centimètres de là. Il y va vider ce qu’il a ramassé et refaire le plein. C’est la seule escale où le corps est en contact direct avec l’extérieur.',
    },
    intro: {
      e: 'Écoute : ça <b>respire</b>. Toutes ces bulles se gonflent et se dégonflent. C’est ici que l’air entre dans ton sang.',
      a: 'Nous descendons le dernier couloir d’air avant les <b>bulles</b>. Chacune est enlacée par un vaisseau. Entre l’air et le sang, il n’y aura qu’une paroi cinq cents fois plus fine qu’un cheveu.',
    },
    card: {
      e: {
        kicker: 'Escale 4', title: 'Un terrain de tennis plié dans ta poitrine',
        html: `<p>L’air que tu respires descend par des tuyaux qui se divisent encore et encore, comme les branches d’un arbre à l’envers. Tout au bout : <b>des millions de petites bulles</b>.</p>
               <p>Chaque bulle est entourée de tuyaux minuscules remplis de sang. L’oxygène traverse la paroi, <em>50 fois plus fine qu’un cheveu</em>, et saute dans le sang. Le gaz usé fait le chemin inverse, et tu le souffles.</p>
               <p>Si on dépliait toutes ces bulles à plat, elles couvriraient à peu près un <b>terrain de tennis</b>.</p>`,
        stats: [['300 millions', 'de petites bulles dans tes poumons'],
                ['1 terrain de tennis', 'leur surface, dépliée'],
                ['20 000', 'respirations par jour'],
                ['0,5 micron', 'l’épaisseur de la paroi à traverser']],
      },
      a: {
        kicker: 'Escale 4', title: 'Un terrain de tennis dans votre poitrine',
        html: `<p>L’air se divise vingt-trois fois avant d’arriver ici. Les seize premières divisions ne servent qu’à conduire. Seules les dernières échangent quoi que ce soit.</p>
               <p>Au bout : <b>300 à 500 millions de bulles</b>. Dépliées, elles couvriraient un court de tennis. Toute cette surface tient dans votre cage thoracique parce qu’elle est repliée à l’extrême, exactement comme dans l’intestin.</p>
               <p>Il n’y a aucun mécanisme de transfert. L’oxygène passe simplement de là où il est concentré vers là où il l’est moins, à travers une paroi trop fine pour le retenir. C’est de la physique, pas de la biologie.</p>
               <p>Un détail décisif : un film savonneux tapisse l’intérieur des bulles. Sans lui, la tension de l’eau les collerait à chaque expiration, et il faudrait un effort énorme pour les rouvrir. Les grands prématurés naissent avant de savoir le fabriquer. On le leur administre à la naissance, et ça a changé leur pronostic.</p>
               <p>Enfin, si vous êtes essoufflé en montant un escalier, ce ne sont presque jamais les poumons. Au repos, un globule rouge fait le plein en un tiers du temps qu’il passe ici. La limite est ailleurs : le cœur, ou le muscle.</p>`,
        stats: [['70 à 100 m²', 'la surface d’échange, un court de tennis'],
                ['0,5 micron', 'l’épaisseur de la paroi à traverser'],
                ['12 à 16', 'respirations par minute au repos'],
                ['0,75 seconde', 'le temps qu’un globule passe devant une bulle']],
      },
    },
    spots: {
      alveole: {
        label: { e: 'La grande bulle', a: 'Le sac d’air' },
        e: { title: 'La bulle magique', html: `<p>En vrai, elle est grosse comme un grain de poussière, et elle se gonfle quand tu inspires. Il y en a <b>tellement</b> que les compter une par une prendrait dix ans.</p>` },
        a: { title: 'Le sac d’air', html: `<p>Un quart de millimètre de diamètre en vrai. Sa paroi est faite de cellules si étirées qu’elles ne sont presque plus que de la membrane, et c’est ce qui permet aux gaz de la traverser.</p>
                                        <p>Les bulles voisines communiquent par de petits orifices. Si un couloir se bouche, la zone en aval continue d’être ventilée par les côtés. Une redondance discrète, mais qui évite bien des accidents.</p>` },
      },
      capillaire: {
        label: { e: 'Le tuyau rouge', a: 'Le filet de sang' },
        e: { title: 'La file indienne', html: `<p>Regarde le tuyau qui s’enroule autour de la bulle : les globules rouges y passent <b>un par un</b>, tellement il est fin. C’est là qu’ils se rechargent en oxygène.</p>` },
        a: { title: 'Le filet de sang', html: `<p>Les vaisseaux sont si serrés autour de chaque bulle qu’ils forment presque une nappe continue de sang. Les globules y passent à la file, un par un, en se déformant pour entrer. Vous pouvez les compter.</p>
                                               <p>Un globule ne reste devant la bulle que trois quarts de seconde au repos, et il a fini de se charger au bout d’un quart de seconde. Cette marge est ce qui vous permet de courir : à l’effort, le sang défile trois fois plus vite, et l’échange se fait quand même.</p>` },
      },
      surfactant: {
        label: { e: 'Le vernis', a: 'Le film anti-collage' },
        e: { title: 'Le liquide anti-collage', html: `<p>Cette pellicule brillante recouvre tout l’intérieur de la bulle et l’empêche de <b>se coller</b> quand tu souffles. Sans elle, respirer serait épuisant.</p>` },
        a: { title: 'Le film anti-collage', html: `<p>Un film gras et savonneux, sécrété par des cellules de la paroi, qui tapisse l’intérieur du sac. Son rôle : casser la tension de l’eau qui, sinon, ferait s’effondrer les petites bulles au profit des grosses à chaque expiration.</p>
                                                   <p>C’est exactement ce qui manque à un enfant né trop tôt, car il ne le fabrique que vers la fin de la grossesse. On le lui instille directement dans les poumons à la naissance. C’est l’une des interventions les plus efficaces de toute la médecine néonatale.</p>` },
      },
      bronchiole: {
        label: { e: 'Le couloir d’air', a: 'Le dernier couloir' },
        e: { title: 'La dernière branche', html: `<p>C’est le plus petit couloir avant les bulles. Ses murs peuvent se serrer ou s’élargir selon les besoins. Chez les asthmatiques, ils se serrent trop.</p>` },
        a: { title: 'Le dernier couloir', html: `<p>Le dernier segment qui ne fait que conduire l’air. Il n’a plus de cartilage pour le tenir ouvert : son diamètre dépend entièrement d’un anneau de muscle autour de lui.</p>
                                                 <p>C’est précisément ici que se joue la crise d’asthme. Ce muscle se contracte, la muqueuse gonfle, le passage se referme. Un bronchodilatateur relâche ce muscle, d’où l’effet en quelques minutes.</p>
                                                 <p>Les cils que vous voyez battent tous dans le même sens, vers le haut, et font remonter les poussières piégées dans le mucus. Le tabac les paralyse. La toux du fumeur, c’est ce travail fait à la main.</p>` },
      },
    },
    quiz: {
      e: { q: 'Si on dépliait toutes tes alvéoles, ça couvrirait…', opts: ['Un terrain de tennis', 'Une feuille de papier', 'Un stade de football'], ok: 0,
           fb: 'Oui ! Environ <b>70 à 100 m²</b>, la taille d’un terrain de tennis, replié dans ta poitrine.' },
      a: { q: 'Quand vous êtes essoufflé en montant un escalier, qu’est-ce qui est le plus souvent limitant ?', opts: ['Le cœur ou le muscle, rarement les poumons', 'La surface des poumons', 'La vitesse de l’air dans les bronches'], ok: 0,
           fb: 'Les poumons ont une <b>énorme réserve</b> : le sang y fait le plein en un tiers du temps disponible. Chez une personne saine, la limite à l’effort est cardiaque ou musculaire.' },
    },
  },

  /* ══════════════════ 5 ══════════════════ */
  {
    id: 'estomac', accent: '#d9b23c', map: [45, 92],
    name: { e: 'L’estomac', a: 'L’estomac' },
    sub: { e: 'La cuve à acide', a: 'La cuve acide' },
    fog: { color: 0x3e2f0d, density: 0.0015 },
    link: {
      e: 'L’oxygène ne suffit pas : il faut aussi de quoi manger. On descend voir par où ça entre.',
      a: 'Le sang livre de l’oxygène, mais aussi du carburant. Ce carburant vient d’ailleurs, et il entre par un tube qui commence à la bouche. Nous allons en visiter la deuxième pièce.',
    },
    intro: {
      e: 'Accroche-toi : on entre dans <b>l’estomac</b>. Ces grandes vagues, c’est le muscle qui mélange la nourriture. Et l’air pique un peu : ici, c’est acide !',
      a: 'Nous entrons dans l’estomac. Ces grands bourrelets s’effacent quand il se remplit. L’ambiance est à un acide comparable à celui d’une batterie diluée, et la paroi tient le coup.',
    },
    card: {
      e: {
        kicker: 'Escale 5', title: 'Une machine à laver acide',
        html: `<p>L’estomac n’est pas un simple sac : c’est un <b>muscle très puissant</b> qui pétrit la nourriture comme de la pâte, trois fois par minute.</p>
               <p>En même temps, il verse un liquide <em>plus acide que le vinaigre</em>. Cet acide casse les aliments en tout petits morceaux et tue la plupart des microbes avalés.</p>
               <p>Alors pourquoi l’estomac ne se digère-t-il pas lui-même ? Parce qu’il fabrique en permanence une couche de <b>mucus</b> qui le protège, et qu’il refait sa paroi tous les trois jours.</p>`,
        stats: [['1,5 litre', 'ce qu’il peut contenir sans forcer'],
                ['3 par minute', 'le nombre de vagues de brassage'],
                ['3 jours', 'pour refaire sa paroi à neuf'],
                ['2 à 4 h', 'pour vider un repas complet']],
      },
      a: {
        kicker: 'Escale 5', title: 'Pourquoi il ne se digère pas lui-même',
        html: `<p>L’estomac fait trois choses : il stocke, il broie, il attaque chimiquement. Il se détend pour accueillir un repas sans que la pression monte, et c’est pour ça qu’on peut avaler un litre et demi sans sensation d’écrasement.</p>
               <p>Il verse un acide puissant, cent mille fois plus concentré que votre sang. Cet acide ne digère presque rien lui-même. Son rôle est d’<b>activer</b> une enzyme qui découpe les protéines, et de tuer ce que vous avalez.</p>
               <p>La vraie question, c’est pourquoi il tient. Réponse : une couche de gel épaisse d’un demi-millimètre, dans laquelle la paroi injecte en continu de quoi neutraliser l’acide. À la surface des cellules, le milieu est presque neutre. Et toute la paroi se refait en trois jours.</p>
               <p>Quand cette défense cède, sous l’effet d’anti-inflammatoires pris trop longtemps ou d’une bactérie particulière qui s’y installe, l’acide attaque la paroi. C’est l’ulcère. Ce n’est pas le stress qui le crée, contrairement à ce qu’on a longtemps enseigné.</p>
               <p>Et la remontée acide qui brûle derrière le sternum n’est pas un excès d’acide. C’est un clapet, en haut, qui ferme mal.</p>`,
        stats: [['pH 1,5 à 3,5', 'plus acide que le vinaigre'],
                ['2 litres', 'de suc versés chaque jour'],
                ['3 fois par minute', 'les vagues de brassage'],
                ['3 à 5 jours', 'pour refaire toute la paroi']],
      },
    },
    spots: {
      plis: {
        label: { e: 'Les vagues', a: 'Les vagues de muscle' },
        e: { title: 'Des vagues de muscle', html: `<p>Ces bourrelets se déplacent du haut vers le bas et écrasent la nourriture contre la sortie. On appelle ça le <b>péristaltisme</b>, et c’est le même mouvement dans tout ton tube digestif.</p>` },
        a: { title: 'Les vagues de muscle', html: `<p>Ces bourrelets ne sont pas fixes. Ce sont des vagues qui descendent vers la sortie et écrasent le contenu au passage. Trois par minute.</p>
                                                   <p>L’estomac est le seul segment du tube digestif à posséder <b>trois</b> couches de muscle au lieu de deux. C’est ce qui lui permet de malaxer en tordant, et pas seulement de pousser.</p>` },
      },
      acide: {
        label: { e: 'Les puits à acide', a: 'Les puits à acide' },
        e: { title: 'Plus fort que le vinaigre', html: `<p>Voilà d’où sort l’acide : ces petits puits creusés dans la paroi. Il est si puissant qu’il dissout la viande, et c’est aussi une excellente <b>barrière anti-microbes</b>.</p>` },
        a: { title: 'Les puits à acide', html: `<p>Voilà la source. Au fond de chacun de ces puits, des cellules pompent activement de l’acide contre un gradient d’un million. C’est un travail énergétique considérable, mené en continu, et il y en a des millions comme celui-ci.</p>
                                                <p>Les médicaments anti-acides les plus efficaces bloquent directement cette pompe, d’où leur nom d’inhibiteurs de la pompe à protons. Ces mêmes cellules produisent une substance sans laquelle la <b>vitamine B12</b> ne peut pas être absorbée plus loin. Après une ablation d’estomac, il faut la donner en injections à vie.</p>` },
      },
      mucus: {
        label: { e: 'Le bouclier', a: 'Le gel protecteur' },
        e: { title: 'Un gel qui sauve la vie', html: `<p>Cette nappe gluante recouvre toute la paroi. Elle empêche l’acide de toucher les cellules vivantes. Quand ce bouclier s’abîme, ça fait un <b>ulcère</b>.</p>` },
        a: { title: 'Le gel protecteur', html: `<p>Un demi-millimètre de gel collant, renouvelé en permanence, dans lequel la paroi diffuse de quoi neutraliser l’acide. Le résultat est un dégradé : très acide dans la cavité, presque neutre au contact des cellules. Vous en voyez ici la tranche.</p>
                                                <p>Deux choses le mettent en échec. Les anti-inflammatoires, qui bloquent la molécule commandant sa fabrication, d’où les ulcères sous traitement prolongé. Et une bactérie capable de survivre dans l’acide en se réfugiant dans le gel, responsable de la majorité des ulcères, qu’un traitement antibiotique élimine.</p>` },
      },
      chyme: {
        label: { e: 'La bouillie', a: 'La bouillie' },
        e: { title: 'Ce qu’il reste du repas', html: `<p>Après quelques heures, ton repas est devenu une <b>bouillie</b> liquide. Elle passe par une petite porte, cuillère par cuillère, vers l’intestin.</p>` },
        a: { title: 'La bouillie', html: `<p>Ce qu’il reste du repas après quelques heures : une suspension acide, presque liquide, lâchée dans l’intestin par petites quantités successives.</p>
                                          <p>La vitesse dépend de ce que vous avez mangé. Les sucres partent vite, les graisses très lentement. C’est l’intestin qui commande ce débit, en freinant l’estomac quand il reçoit du gras. D’où la sensation de lourdeur qui dure après un repas riche : l’estomac est encore plein.</p>` },
      },
    },
    quiz: {
      e: { q: 'Pourquoi l’estomac ne se digère-t-il pas lui-même ?', opts: ['Une couche de mucus le protège', 'Il n’y a pas vraiment d’acide', 'Il est en métal'], ok: 0,
           fb: 'Exact : un <b>gel protecteur</b> recouvre sa paroi, et celle-ci se renouvelle tous les trois jours.' },
      a: { q: 'Quelle est la cause la plus fréquente d’un ulcère de l’estomac ?', opts: ['Une bactérie, ou les anti-inflammatoires', 'Le stress au travail', 'Un excès d’aliments épicés'], ok: 0,
           fb: 'On a longtemps accusé le stress. Ce sont en réalité une <b>bactérie</b> installée dans le gel protecteur, ou les <b>anti-inflammatoires</b> pris au long cours. La première se traite par antibiotiques.' },
    },
  },

  /* ══════════════════ 6 ══════════════════ */
  {
    id: 'intestin', accent: '#ff9d5c', map: [50, 112],
    name: { e: 'L’intestin', a: 'L’intestin grêle' },
    sub: { e: 'La forêt de doigts', a: 'La forêt qui absorbe' },
    fog: { color: 0x2c1206, density: 0.0055 },
    link: {
      e: 'L’estomac n’a fait que préparer la bouillie. C’est juste après qu’elle passe pour de bon dans le sang.',
      a: 'L’estomac prépare, il n’absorbe presque rien. Le passage de la nourriture vers le sang se fait dans le segment suivant, et il se fait sur une surface qu’on n’imagine pas.',
    },
    intro: {
      e: 'Regarde cette forêt qui ondule : ce sont des <b>millions de petits doigts</b>. Ils attrapent la nourriture et la font passer dans ton sang.',
      a: 'Cette forêt qui ondule autour de vous, ce sont des millions de petits doigts d’un demi-millimètre. C’est ici que ce que vous mangez devient vous.',
    },
    card: {
      e: {
        kicker: 'Escale 6', title: 'Six mètres pliés dans ton ventre',
        html: `<p>L’intestin grêle est un tuyau de <b>6 à 7 mètres</b>, replié pour tenir dans ton ventre. C’est ici que la nourriture devient vraiment <em>toi</em>.</p>
               <p>Sa paroi n’est pas lisse. Elle est couverte de doigts minuscules, eux-mêmes couverts de doigts encore plus petits. Ça multiplie énormément la surface, comme une serviette éponge, mais en mille fois mieux.</p>
               <p>Chaque doigt contient un tout petit vaisseau. Les sucres, les vitamines et les protéines découpées y sautent et partent dans le sang.</p>`,
        stats: [['6 à 7 mètres', 'de long, plié dans ton ventre'],
                ['30 m²', 'la surface qui absorbe, dépliée'],
                ['3 à 5 heures', 'pour le traverser en entier'],
                ['3 jours', 'pour renouveler toute sa paroi']],
      },
      a: {
        kicker: 'Escale 6', title: 'Le même truc, répété trois fois',
        html: `<p>Sept mètres de tuyau repliés dans votre ventre. Tout ce que vous absorbez de la journée passe par ici. Le côlon, ensuite, ne récupère guère que de l’eau.</p>
               <p>Le problème à résoudre est simple : maximiser la surface de contact. La solution est appliquée <b>trois fois de suite</b>. De grands replis en accordéon multiplient la surface par trois. Chaque repli est couvert de doigts, qui multiplient par dix. Chaque cellule de chaque doigt porte des milliers de micro-doigts, qui multiplient par vingt.</p>
               <p>Résultat : environ <b>30 m²</b> de surface absorbante. On a longtemps cité 200 m² et un terrain de tennis. Les mesures modernes sont plus modestes, et déjà remarquables.</p>
               <p>Un détail qui surprend : les graisses ne prennent pas la même sortie que le reste. Sucres et protéines vont directement au foie. Les graisses partent par le réseau lymphatique et rejoignent le sang près du cou, en contournant le foie.</p>
               <p>Enfin, cette paroi se renouvelle intégralement en trois à cinq jours. C’est le tissu le plus rapide du corps, et c’est pourquoi une chimiothérapie, qui vise les cellules à division rapide, donne presque toujours des troubles digestifs.</p>`,
        stats: [['≈ 30 m²', 'la surface d’absorption réelle'],
                ['20 000', 'micro-doigts sur une seule cellule'],
                ['3 à 5 jours', 'pour renouveler toute la paroi'],
                ['100 000 milliards', 'de bactéries dans le tube digestif']],
      },
    },
    spots: {
      villosite: {
        label: { e: 'Le grand doigt', a: 'Une villosité' },
        e: { title: 'Le doigt qui attrape', html: `<p>En vrai, il mesure moins d’un millimètre, et il bouge tout seul pour brasser la nourriture autour de lui. Il y en a <b>des millions</b> côte à côte.</p>` },
        a: { title: 'Une villosité', html: `<p>Un demi-millimètre à peine en vrai, mais elle possède son propre petit muscle et se balance toute seule. Ce mouvement n’est pas décoratif : il renouvelle en permanence le liquide immobile qui stagnerait contre sa surface, sans quoi l’absorption s’étoufferait elle-même.</p>
                                       <p>À l’intérieur : un vaisseau sanguin, un vaisseau lymphatique, et des terminaisons nerveuses. Le tube digestif possède son propre réseau de neurones, environ cent millions, autant que la moelle épinière d’un chat.</p>` },
      },
      brosse: {
        label: { e: 'Les micro-doigts', a: 'Les micro-doigts' },
        e: { title: 'Encore plus petit !', html: `<p>Regarde de près : le doigt est lui-même couvert de <b>milliers de poils microscopiques</b>. C’est le secret de l’intestin : ajouter de la surface, encore et encore.</p>` },
        a: { title: 'Les micro-doigts', html: `<p>Vingt mille par cellule. Ce sont eux qui donnent à la villosité son aspect de velours. Ils ne servent pas qu’à gagner de la surface : ils portent les <b>enzymes</b> qui terminent le découpage, juste à côté des portes qui font entrer le résultat. Découpage et absorption au même endroit, à quelques nanomètres près.</p>
                                                <p>L’une de ces enzymes découpe le sucre du lait. La plupart des adultes dans le monde cessent de la produire après l’enfance. Le lactose non découpé arrive alors intact dans le côlon, où les bactéries le fermentent. Ballonnements, gaz, diarrhée. Ce n’est pas une allergie, c’est une enzyme manquante, ici même.</p>` },
      },
      chylifere: {
        label: { e: 'Le tuyau blanc', a: 'La sortie des graisses' },
        e: { title: 'La route des graisses', html: `<p>Au centre du doigt, ce tuyau blanc est réservé aux graisses. Elles ne prennent pas la même route que le reste et rejoignent la circulation beaucoup plus loin.</p>` },
        a: { title: 'La sortie des graisses', html: `<p>Un vaisseau lymphatique fermé au bout, planté au centre de chaque villosité. Les graisses sont emballées en gouttelettes trop grosses pour entrer dans un vaisseau sanguin, alors elles empruntent ce chemin-là.</p>
                                                     <p>La lymphe chargée de graisses devient laiteuse après un repas gras, d’où son nom. Elle remonte jusqu’à la base du cou avant de rejoindre le sang, <b>sans passer par le foie</b>. C’est pourquoi certains médicaments liposolubles échappent au filtrage hépatique.</p>` },
      },
      microbiote: {
        label: { e: 'Les bactéries amies', a: 'Vos bactéries' },
        e: { title: 'Des milliards de colocataires', html: `<p>Des bactéries vivent dans ton intestin, et elles sont <b>utiles</b> : elles digèrent ce que tu ne peux pas digérer et t’aident à te défendre.</p>` },
        a: { title: 'Vos bactéries', html: `<p>Environ cent mille milliards, surtout dans le côlon. Elles pèsent près de deux kilos et portent cent fois plus de gènes que vous.</p>
                                            <p>Elles ne sont pas des passagers. Elles fermentent les fibres que vous ne savez pas digérer et en tirent des molécules dont vos propres cellules intestinales se nourrissent. Elles fabriquent une partie de vos vitamines K et B. Elles occupent la place, ce qui empêche les indésirables de s’installer.</p>
                                            <p>C’est aussi pour ça qu’un antibiotique donne la diarrhée : il ne fait pas le tri.</p>` },
      },
    },
    quiz: {
      e: { q: 'À quoi servent les millions de petits doigts de l’intestin ?', opts: ['À augmenter la surface qui absorbe', 'À pousser la nourriture', 'À fabriquer de l’acide'], ok: 0,
           fb: 'Bien vu ! Plus de surface, c’est plus de nourriture récupérée. Dépliés, ils couvriraient <b>30 m²</b>.' },
      a: { q: 'Qu’est-ce que l’intolérance au lactose, exactement ?', opts: ['Une enzyme intestinale qu’on cesse de produire', 'Une allergie aux protéines du lait', 'Un excès d’acidité gastrique'], ok: 0,
           fb: 'Ce n’est pas une allergie. C’est l’<b>enzyme</b> qui découpe le sucre du lait qui disparaît après l’enfance chez la majorité des adultes. Le lactose intact arrive au côlon, où les bactéries le fermentent.' },
    },
  },
  /* ══════════════════ 7 ══════════════════ */
  {
    id: 'foie', accent: '#b8543f', map: [66, 86],
    name: { e: 'Le foie', a: 'Le foie' },
    sub: { e: 'L’usine du corps', a: 'L’usine chimique' },
    fog: { color: 0x2a0d0a, density: 0.0018 },
    link: {
      e: 'Tout ce que l’intestin a récupéré part au même endroit avant d’aller ailleurs. On suit le convoi.',
      a: 'Ce que l’intestin absorbe ne file pas directement dans la circulation générale. Un organe s’est mis en travers du chemin, et rien ne passe sans son accord.',
    },
    intro: {
      e: 'Ici, tout est bien rangé : le <b>foie</b> est une usine. Ces couloirs rouges sont des lignes de production, et il y en a des centaines de milliers, toutes identiques.',
      a: 'Le foie est bâti sur un seul motif, répété cent mille fois. Ces couloirs rayonnants sont des lignes de production identiques. Tout ce que vous avalez passe ici avant d’atteindre le reste du corps.',
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
        kicker: 'Escale 7', title: 'Le péage obligatoire',
        html: `<p>Un kilo et demi, et une particularité que rien d’autre ne partage : les trois quarts de son sang ne viennent pas du cœur mais de l’intestin. Tout ce que vous absorbez arrive ici <b>avant</b> d’atteindre la circulation générale.</p>
               <p>C’est un péage. Le foie prélève, transforme, stocke, détruit. Le sucre en excès est mis en réserve, et entre les repas il le relâche pour maintenir votre glycémie. Sans lui, vous ne tiendriez pas une nuit sans manger.</p>
               <p>Ce péage explique la pharmacologie. Beaucoup de médicaments avalés sont en partie détruits avant même d’avoir agi, d’où des doses orales plus fortes qu’en injection. Certains, à l’inverse, ne deviennent actifs qu’après passage ici.</p>
               <p>L’alcool suit le même chemin. Le foie le transforme d’abord en une molécule plus toxique que l’alcool lui-même, avant de la neutraliser. Quand la première étape va plus vite que la seconde, cette molécule s’accumule, et c’est l’essentiel de la gueule de bois. Le foie ne traite qu’<b>un verre par heure</b>, quoi qu’on fasse. Ni le café, ni l’eau, ni la douche froide n’y changent rien.</p>
               <p>Enfin, c’est le seul organe qui repousse. Amputé des deux tiers, il retrouve sa masse en quelques semaines, et c’est ce qui permet le don entre vivants.</p>`,
        stats: [['1,5 kg', 'le plus gros organe interne'],
                ['75 %', 'de son sang vient directement de l’intestin'],
                ['1 verre/heure', 'la vitesse d’élimination de l’alcool'],
                ['Quelques semaines', 'pour repousser après ablation des deux tiers']],
      },
    },
    spots: {
      lobule: {
        label: { e: 'Un module', a: 'Un module' },
        e: { title: 'Le même motif, partout', html: `<p>Le foie est fait du même petit module répété des <b>centaines de milliers de fois</b>, comme les alvéoles d’une ruche. Chacun travaille exactement de la même façon.</p>` },
        a: { title: 'Un module', html: `<p>Un hexagone d’un à deux millimètres, répété cent mille fois. Le sang entre par les angles et converge vers une veine centrale. La bile part en sens inverse. Deux circulations à contre-courant dans le même espace.</p>
                                        <p>Les cellules d’entrée baignent dans un sang riche en oxygène, celles du centre dans un sang appauvri. Elles ne font donc pas le même travail, et ne meurent pas dans le même ordre. Une intoxication au paracétamol détruit d’abord le centre.</p>` },
      },
      hepatocyte: {
        label: { e: 'L’ouvrier', a: 'La cellule à tout faire' },
        e: { title: 'La cellule à tout faire', html: `<p>Une seule de ces cellules sait faire <b>des centaines de choses</b> à la fois : stocker, fabriquer, nettoyer. C’est la plus polyvalente du corps.</p>` },
        a: { title: 'La cellule à tout faire', html: `<p>La cellule la plus polyvalente du corps. Elle fabrique l’albumine qui retient l’eau dans vos vaisseaux, la plupart des facteurs qui font coaguler votre sang, le cholestérol, les sels biliaires, et l’urée qui évacue vos déchets azotés.</p>
                                                      <p>C’est aussi elle qui démonte les médicaments, grâce à une famille d’enzymes très nombreuse. Deux personnes n’ont pas les mêmes versions de ces enzymes. À dose égale, l’une éliminera un médicament deux fois plus vite que l’autre. Le pamplemousse en bloque une, ce qui fait grimper la concentration de certains traitements. La mise en garde sur les notices vient de là.</p>` },
      },
      sinusoide: {
        label: { e: 'Le couloir de sang', a: 'Le couloir percé' },
        e: { title: 'Un couloir plein de trous', html: `<p>Ces couloirs laissent le sang <b>toucher directement</b> les cellules du foie. Il n’y a presque pas de barrière, et c’est ce qui rend le tri si efficace.</p>` },
        a: { title: 'Le couloir percé', html: `<p>Ailleurs dans le corps, la paroi des vaisseaux est étanche. Ici, elle est criblée de trous. Le plasma s’échappe et baigne directement les cellules du foie. Il n’y a presque aucune barrière entre votre sang et l’usine.</p>
                                               <p>Des cellules dévoreuses patrouillent ces couloirs et capturent les bactéries qui auraient franchi la paroi intestinale. C’est un filtre sanitaire permanent, invisible et considérable.</p>` },
      },
      bile: {
        label: { e: 'La bile', a: 'La bile' },
        e: { title: 'Le savon des graisses', html: `<p>Le foie fabrique un liquide vert-jaune, la <b>bile</b>, stocké dans la vésicule. Au moment du repas, elle est lâchée dans l’intestin pour découper les graisses en gouttelettes.</p>` },
        a: { title: 'La bile', html: `<p>Un litre par jour, stocké et concentré dans la vésicule entre les repas. Elle agit comme un détergent : elle casse les graisses en gouttelettes assez fines pour que les enzymes puissent les attaquer. Sans elle, les graisses traversent l’intestin sans être absorbées.</p>
                                      <p>Elle sert aussi de poubelle. C’est par là que part le produit de dégradation des vieux globules rouges, celui qui donne aux selles leur couleur. Quand la voie est bouchée, ce pigment reflue dans le sang : la peau et les yeux jaunissent, et les selles se décolorent.</p>
                                      <p>95 % des sels biliaires sont récupérés en fin d’intestin et renvoyés au foie. Ils font ce circuit plusieurs fois par repas.</p>` },
      },
    },
    quiz: {
      e: { q: 'Quel organe est capable de repousser après avoir été coupé ?', opts: ['Le foie', 'Le cœur', 'Le cerveau'], ok: 0,
           fb: 'Le <b>foie</b> ! C’est le seul organe interne capable de se reconstruire.' },
      a: { q: 'Peut-on accélérer l’élimination de l’alcool ?', opts: ['Non, le foie traite environ un verre par heure', 'Oui, en buvant beaucoup d’eau', 'Oui, avec du café fort'], ok: 0,
           fb: 'Le rythme est fixé par une enzyme saturée en permanence : <b>environ un verre par heure</b>, quoi qu’on fasse. Le café rend éveillé, pas sobre.' },
    },
  },

  /* ══════════════════ 8 ══════════════════ */
  {
    id: 'rein', accent: '#8fa8ff', map: [40, 98],
    name: { e: 'Le rein', a: 'Le rein' },
    sub: { e: 'La station d’épuration', a: 'Le régulateur' },
    fog: { color: 0x101832, density: 0.0016 },
    link: {
      e: 'On a vu ce qui entre et ce qui est trié. Reste à voir ce qui sort, et qui décide de le jeter.',
      a: 'Le foie transforme, mais il ne jette pas. Il faut bien que les déchets sortent quelque part, et que quelqu’un décide de la quantité d’eau et de sel à garder.',
    },
    intro: {
      e: 'Cette pelote de tuyaux est un <b>filtre</b>. Le sang y entre sale et en ressort propre. Tout ce qui est en trop part vers la sortie.',
      a: 'Cette pelote de vaisseaux est un filtre, et vous en avez deux millions. La méthode est brutale : on laisse tout passer, puis on récupère 99 % de ce qui vient de sortir.',
    },
    card: {
      e: {
        kicker: 'Escale 8', title: 'Filtrer 180 litres pour n’en jeter qu’un',
        html: `<p>Tu as deux reins, de la taille d’un poing chacun. Leur travail : <b>nettoyer ton sang</b> en permanence.</p>
               <p>Ils sont fous de précision. Chaque jour, ils filtrent <em>180 litres</em> de liquide, l’équivalent d’une baignoire. Puis ils récupèrent presque tout : l’eau, le sucre, le sel utile.</p>
               <p>À la fin, il ne reste qu’environ <b>1,5 litre</b> d’urine : les déchets et le trop-plein d’eau. Rien ne se perd.</p>`,
        stats: [['180 litres', 'filtrés chaque jour'],
                ['1,5 litre', 'seulement est éliminé'],
                ['1 million', 'de mini-filtres par rein'],
                ['Toutes les 30 min', 'tout ton sang y repasse']],
      },
      a: {
        kicker: 'Escale 8', title: 'Jeter presque tout, puis tout reprendre',
        html: `<p>La méthode est contre-intuitive. Plutôt que d’extraire sélectivement les déchets, le rein vide brutalement une baignoire entière de plasma, <b>180 litres par jour</b>, et récupère ensuite plus de 99 % de ce qu’il vient de laisser partir.</p>
               <p>Absurde ? Non. C’est ce qui permet de tout régler séparément. Le corps ne choisit pas ce qu’il jette, il choisit ce qu’il <b>reprend</b>, et chaque substance a son propre robinet.</p>
               <p>Vous voyez le résultat tous les jours. Urine foncée et rare : le corps manque d’eau et la reprend presque toute. Urine claire après deux cafés : il en laisse filer.</p>
               <p>Et le rein ne fait pas que filtrer. Il règle votre <b>tension artérielle</b> en ajustant la quantité d’eau et de sel conservée, d’où les diurétiques comme traitement de l’hypertension. Il commande la fabrication des globules rouges, et c’est pourquoi les insuffisants rénaux sont anémiques : on leur donne l’hormone que leurs reins ne produisent plus. Il active enfin la vitamine D, sans quoi le calcium n’est pas absorbé.</p>
               <p>Un rein qui s’arrête, ce n’est donc pas un problème de propreté. C’est la tension, le sang et les os qui lâchent en même temps.</p>`,
        stats: [['180 litres', 'filtrés chaque jour, une baignoire'],
                ['plus de 99 %', 'récupéré aussitôt'],
                ['1 million', 'de filtres par rein'],
                ['20 à 25 %', 'du débit du cœur passe par les reins']],
      },
    },
    spots: {
      glomerule: {
        label: { e: 'La pelote', a: 'La passoire' },
        e: { title: 'La passoire', html: `<p>Un peloton de tuyaux minuscules, percés de trous si fins que seules les <b>toutes petites choses</b> passent. Les globules et les grosses protéines restent dans le sang.</p>` },
        a: { title: 'La passoire', html: `<p>Un peloton de vaisseaux maintenu sous haute pression entre deux robinets. En resserrant l’un ou l’autre, le rein règle finement son débit de filtration.</p>
                                          <p>Le tamis retient tout ce qui est trop gros, mais pas seulement. Il est chargé négativement, et repousse électriquement les protéines du sang qui le sont aussi. Quand cette charge s’abîme, sous l’effet du diabète ou de l’hypertension, les protéines passent. Trouver de l’albumine dans les urines est l’un des tout premiers signes d’atteinte rénale, bien avant tout symptôme.</p>` },
      },
      bowman: {
        label: { e: 'La coupelle', a: 'La coupelle' },
        e: { title: 'Le récipient', html: `<p>Tout ce qui traverse le filtre tombe dans cette coupelle, puis part dans un long tuyau. C’est le début de l’urine, mais elle est encore <b>bien trop diluée</b>.</p>` },
        a: { title: 'La coupelle', html: `<p>Une capsule qui recueille le filtrat. Sa paroi interne est faite de cellules à pieds multiples qui enlacent les vaisseaux et ne laissent entre elles que des fentes de vingt-cinq nanomètres.</p>
                                          <p>Ce qui tombe ici a exactement la composition de votre plasma, protéines en moins. Ce n’est pas encore de l’urine : tout le travail de récupération commence après.</p>` },
      },
      henle: {
        label: { e: 'La boucle', a: 'L’épingle à cheveux' },
        e: { title: 'La boucle magique', html: `<p>Ce long tuyau plonge, fait demi-tour et remonte. Cette forme en épingle permet de <b>récupérer l’eau</b>, et c’est pour ça que tu peux boire peu et survivre.</p>` },
        a: { title: 'L’épingle à cheveux', html: `<p>Un long tuyau qui plonge, fait demi-tour et remonte, les deux branches accolées. La descendante laisse sortir l’eau, la montante pompe le sel sans laisser passer l’eau. Le sel ainsi extrait rend le tissu autour de plus en plus salé en profondeur.</p>
                                                  <p>Cette zone très salée est ce qui vous permet, ensuite, d’aspirer l’eau hors de l’urine et de la concentrer. Sans cette boucle, impossible de survivre en buvant peu. Plus elle est longue, plus l’animal résiste à la sécheresse, et celle du rat des sables est énorme.</p>` },
      },
      collecteur: {
        label: { e: 'La sortie', a: 'Le dernier robinet' },
        e: { title: 'Le dernier réglage', html: `<p>Juste avant la sortie, le corps décide combien d’eau il garde. Si tu as soif, il en garde beaucoup, et ton pipi devient <b>plus foncé</b>.</p>` },
        a: { title: 'Le dernier robinet', html: `<p>C’est ici que se décide la concentration finale. Une hormone commande l’insertion de canaux à eau dans la paroi. Plus il y en a, plus l’eau est réabsorbée, plus l’urine est concentrée.</p>
                                                 <p>L’alcool bloque cette hormone. D’où les allers-retours aux toilettes en soirée, et la déshydratation du lendemain matin, qui explique une bonne part du mal de tête.</p>` },
      },
    },
    quiz: {
      e: { q: 'Combien de litres tes reins filtrent-ils chaque jour ?', opts: ['180 litres', '2 litres', '20 litres'], ok: 0,
           fb: '<b>180 litres</b> filtrés, mais 99 % sont récupérés. Il ne sort qu’un litre et demi.' },
      a: { q: 'Pourquoi les insuffisants rénaux sont-ils anémiques ?', opts: ['Le rein commande la fabrication des globules rouges', 'Les globules rouges sont filtrés et perdus', 'Le fer est éliminé dans les urines'], ok: 0,
           fb: 'Le rein produit l’hormone qui ordonne à la moelle de fabriquer des globules rouges. Sans elle, la production chute, et on la donne donc en traitement. C’est la même molécule que celle détournée dans le <b>dopage</b>.' },
    },
  },

  /* ══════════════════ 9 ══════════════════ */
  {
    id: 'charpente', accent: '#e8dcc8', map: [30, 168],
    name: { e: 'Os et muscles', a: 'Os et muscles' },
    sub: { e: 'La structure vivante', a: 'La structure vivante' },
    fog: { color: 0x1a1410, density: 0.0013 },
    link: {
      e: 'Livrer, trier, jeter : d’accord. Mais pour qui ? Pour ce qui te tient debout et te fait bouger.',
      a: 'Toute cette logistique a un destinataire. Voici le plus gros client du système : la charpente qui vous porte, et les moteurs qui la déplacent. Au passage, c’est ici qu’est fabriqué le sang lui-même.',
    },
    intro: {
      e: 'On entre <b>dans un os</b>. Surprise : ce n’est pas plein ! C’est une dentelle très solide, et à l’intérieur, une usine fabrique tes globules rouges.',
      a: 'Nous sommes <b>à l’intérieur d’un os</b>. Il n’est pas plein : c’est une dentelle de poutres orientées exactement dans le sens des forces. Dans les espaces, l’usine à sang.',
    },
    card: {
      e: {
        kicker: 'Escale 9', title: 'Vivants, et bien vivants',
        html: `<p>On croit souvent que les os sont des cailloux secs. Faux : ils sont <b>vivants</b>, traversés de vaisseaux et de nerfs, et ils se réparent tout seuls.</p>
               <p>À l’intérieur, ce n’est pas plein mais construit comme une <em>tour Eiffel miniature</em> : léger et très résistant. Et dans les trous, la moelle fabrique <b>2 millions de globules rouges par seconde</b>.</p>
               <p>À côté, les muscles. Ils ne poussent jamais, ils ne savent que <b>tirer</b>. C’est pour ça qu’ils marchent par paires : un pour plier, un pour déplier.</p>`,
        stats: [['206 os', 'chez l’adulte, mais 270 à la naissance'],
                ['2 millions/s', 'de globules rouges fabriqués'],
                ['600', 'muscles environ dans ton corps'],
                ['10 ans', 'pour renouveler tout ton squelette']],
      },
      a: {
        kicker: 'Escale 9', title: 'Un matériau qui se réorganise tout seul',
        html: `<p>L’os n’est pas un caillou. C’est un composite : des fibres souples qui encaissent la traction, imprégnées d’un minéral dur qui encaisse la compression. Ni l’un ni l’autre séparément ne tiendrait. C’est le principe du béton armé.</p>
               <p>Et il n’est pas figé. Des cellules le rongent en permanence, d’autres le reconstruisent derrière. Votre squelette est <b>intégralement remplacé en une dizaine d’années</b>.</p>
               <p>Ce chantier permanent lui permet de s’adapter. Les poutres que vous voyez s’orientent dans le sens des forces qu’elles subissent. Chargez un os, il se renforce. Cessez de vous en servir, il fond. Un astronaute perd 1 à 2 % de masse osseuse par mois en apesanteur, et un membre plâtré s’affaiblit en quelques semaines.</p>
               <p>L’ostéoporose n’est pas un os qui se creuse uniformément. Ce sont ces poutres qui s’amincissent puis se rompent une à une. La résistance chute bien plus vite que la masse perdue ne le laisserait croire.</p>
               <p>À côté, le muscle. Il ne fait qu’une chose : <b>tirer</b>. Aucun muscle ne pousse. D’où le fonctionnement par paires opposées, un pour plier, un pour déplier.</p>`,
        stats: [['206', 'os chez l’adulte, 270 à la naissance'],
                ['10 ans', 'pour renouveler tout le squelette'],
                ['1 à 2 %', 'de masse osseuse perdue par mois en apesanteur'],
                ['30 à 40 %', 'du poids du corps : les muscles']],
      },
    },
    spots: {
      travee: {
        label: { e: 'La dentelle', a: 'Les poutres' },
        e: { title: 'Léger et costaud', html: `<p>Ces petites poutres ne sont pas placées au hasard. Elles suivent exactement les directions où l’os est <b>poussé et tiré</b>. Le maximum de solidité avec le minimum de matière.</p>` },
        a: { title: 'Les poutres', html: `<p>Elles ne sont pas disposées au hasard : elles épousent les lignes de force qui traversent l’os. Un ingénieur qui calculerait la structure la plus légère pour ces contraintes retrouverait à peu près ce dessin.</p>
                                          <p>Sauf qu’aucun plan n’existe. Les cellules emprisonnées dans l’os détectent les micro-déformations et pilotent la reconstruction en conséquence. La forme est un <b>résultat</b>, pas une consigne, et elle se met à jour quand l’usage change.</p>` },
      },
      moelle: {
        label: { e: 'La moelle', a: 'L’usine à sang' },
        e: { title: 'L’usine à cellules', html: `<p>Une usine qui tourne <b>jour et nuit</b> : deux millions de globules rouges fabriqués chaque seconde, plus les globules blancs et les plaquettes.</p>` },
        a: { title: 'L’usine à sang', html: `<p>Toutes vos cellules sanguines, rouges, blanches et plaquettes, descendent d’un même type de cellule souche, ici. Deux millions de globules rouges par seconde, ajustés en permanence par un signal venu des reins.</p>
                                             <p>C’est cette usine que détruit une leucémie, et c’est elle qu’on remplace lors d’une greffe de moelle. Chez l’adulte elle ne subsiste que dans quelques os plats, bassin, sternum et côtes, ce qui explique où l’on va la prélever.</p>` },
      },
      fibre: {
        label: { e: 'La fibre', a: 'La fibre musculaire' },
        e: { title: 'Des élastiques qui tirent', html: `<p>Chaque fibre est bourrée de fils qui <b>glissent</b> les uns sur les autres. Des millions de tout petits mouvements, tous ensemble, et le muscle raccourcit.</p>` },
        a: { title: 'La fibre musculaire', html: `<p>Une seule cellule, longue parfois de plusieurs centimètres et contenant des centaines de noyaux. À l’intérieur, deux jeux de filaments imbriqués.</p>
                                                  <p>La contraction est purement mécanique. De petites têtes moléculaires s’accrochent au filament voisin, pivotent, tirent, lâchent, et recommencent. Des milliards de ces micro-mouvements en même temps, et le muscle raccourcit. Chaque cycle coûte de l’énergie, d’où la chaleur produite, et le frisson quand le corps a besoin de se réchauffer.</p>
                                                  <p>La rigidité cadavérique vient de là : sans énergie, les têtes s’accrochent et ne peuvent plus lâcher.</p>` },
      },
      jonction: {
        label: { e: 'Le fil du nerf', a: 'L’ordre de bouger' },
        e: { title: 'L’ordre de bouger', html: `<p>Un nerf arrive et dépose un <b>message chimique</b> sur le muscle. En quelques millièmes de seconde, la fibre se contracte. C’est ce qui se passe quand tu décides de bouger le doigt.</p>` },
        a: { title: 'L’ordre de bouger', html: `<p>Le point où le nerf touche le muscle. Le message y devient chimique : une molécule est libérée, se fixe en face, et déclenche la contraction en quelques millièmes de seconde.</p>
                                                 <p>Ce relais est délibérément surdimensionné. Il libère bien plus que nécessaire, pour ne jamais rater. C’est aussi une cible : les curares le bloquent, ce qui permet l’anesthésie, le botulisme empêche la libération, et la toxine botulique injectée en ride du lion fait exactement la même chose, en très local.</p>` },
      },
    },
    quiz: {
      e: { q: 'Que fabrique la moelle à l’intérieur des os ?', opts: ['Les cellules du sang', 'Du calcium liquide', 'De la graisse uniquement'], ok: 0,
           fb: 'Exact : <b>2 millions de globules rouges par seconde</b>, plus les globules blancs et les plaquettes.' },
      a: { q: 'Pourquoi les astronautes perdent-ils de la masse osseuse ?', opts: ['L’os se reconstruit selon les forces qu’il subit', 'Le calcium s’évapore en apesanteur', 'Ils manquent de vitamine D'], ok: 0,
           fb: 'L’os est un tissu <b>adaptatif</b> : sans charge, les cellules qui le rongent prennent le dessus. 1 à 2 % par mois en orbite. Le même mécanisme affaiblit un membre plâtré.' },
    },
  },

  /* ══════════════════ 10 ══════════════════ */
  {
    id: 'cerveau', accent: '#a98cff', map: [50, 20],
    name: { e: 'Le cerveau', a: 'Le cerveau' },
    sub: { e: 'La forêt électrique', a: 'La forêt électrique' },
    fog: { color: 0x0b0a22, density: 0.0011 },
    link: {
      e: 'Neuf escales, et jamais personne aux commandes. On monte voir celui qu’on soupçonne de diriger.',
      a: 'Neuf escales, et nulle part de poste de pilotage. Voici le seul organe qui pourrait prétendre au titre. La fin du voyage dira s’il le mérite.',
    },
    intro: {
      e: 'Regarde ces éclairs ! Chaque trait de lumière est une <b>pensée</b> qui passe. Nous sommes dans le cerveau, au milieu de milliards de neurones.',
      a: 'Chaque trait lumineux qui file le long de ces branches est une impulsion électrique réelle. Il y en a en permanence, par milliards, y compris pendant votre sommeil.',
    },
    card: {
      e: {
        kicker: 'Escale 10', title: '86 milliards de bavards',
        html: `<p>Ton cerveau contient <b>86 milliards de neurones</b>. Chacun est branché à des milliers d’autres, ce qui fait plus de connexions qu’il n’y a d’étoiles dans notre galaxie.</p>
               <p>Ils se parlent avec de <em>l’électricité</em> qui file le long de leurs bras, puis avec de <em>petits messages chimiques</em> pour sauter d’un neurone à l’autre.</p>
               <p>Et quand tu apprends quelque chose, ces connexions <b>changent vraiment</b> : certaines se renforcent, d’autres disparaissent. Apprendre, c’est modifier son cerveau.</p>`,
        stats: [['86 milliards', 'de neurones'],
                ['360 km/h', 'la vitesse des messages les plus rapides'],
                ['20 %', 'de ton énergie, pour 2 % de ton poids'],
                ['1,3 kg', 'et il ne se repose jamais']],
      },
      a: {
        kicker: 'Escale 10', title: 'Un kilo trois qui coûte très cher',
        html: `<p>86 milliards de neurones, et environ cent mille milliards de connexions entre eux. Le nombre ne veut pas dire grand-chose. Ce qui compte, c’est que chaque neurone en écoute des milliers d’autres avant de décider s’il parle.</p>
               <p>Pour 2 % de votre poids, cet organe consomme <b>20 % de votre oxygène et de votre sucre</b>. Et il ne stocke rien. Trois minutes sans sang, et les dégâts sont irréversibles : c’est toute l’urgence de l’AVC.</p>
               <p>Le signal électrique file le long des fibres à <b>360 km/h</b> pour les plus rapides. Mais il ne saute pas d’un neurone à l’autre. Il s’arrête à un espace vide, se transforme en molécules qui traversent, et redevient électrique en face. Ce passage prend un millième de seconde et coûte l’essentiel de l’énergie du cerveau.</p>
               <p>Pourquoi cette complication ? Parce qu’un contact chimique est <b>réglable</b>. Il peut se renforcer, s’affaiblir, disparaître. Apprendre, c’est modifier ces contacts. Et c’est là qu’agissent la plupart des substances qui changent l’humeur ou la vigilance : antidépresseurs, caféine, alcool, drogues. Toutes travaillent dans cet espace vide.</p>`,
        stats: [['86 milliards', 'de neurones'],
                ['100 000 milliards', 'de connexions'],
                ['20 %', 'de votre énergie pour 2 % du poids'],
                ['3 minutes', 'sans sang avant les lésions irréversibles']],
      },
    },
    spots: {
      neurone: {
        label: { e: 'Un neurone', a: 'Un neurone' },
        e: { title: 'L’arbre qui pense', html: `<p>Il a des <b>branches</b> pour écouter, un corps pour décider, et un <b>long fil</b> pour transmettre. Certains de ces fils descendent jusqu’à ton pied, soit presque un mètre.</p>` },
        a: { title: 'Un neurone', html: `<p>Des branches pour écouter, un corps pour additionner, un long fil pour transmettre. Le principe est celui d’un vote : le neurone reçoit des milliers de signaux, les uns qui l’encouragent, les autres qui le retiennent, et il ne parle que si le total dépasse un seuil.</p>
                                         <p>Tout ou rien : le signal part à pleine puissance, ou pas du tout. L’intensité d’une sensation n’est donc pas codée par la force du signal mais par sa <b>fréquence</b>. Certains de ces fils descendent de la moelle jusqu’au pied, soit une seule cellule d’un mètre de long.</p>` },
      },
      synapse: {
        label: { e: 'Le saut', a: 'L’espace vide' },
        e: { title: 'Le petit saut chimique', html: `<p>Regarde bien : les deux neurones <b>ne se touchent pas</b>. Il reste un espace minuscule entre le renflement et la bosse d’en face. Pour le franchir, le message se transforme en gouttelettes chimiques qui traversent.</p>` },
        a: { title: 'L’espace vide', html: `<p>Vous y êtes. Le renflement vient de l’axone, la bosse d’en face appartient à la cellule suivante, et entre les deux il n’y a rien. Vingt nanomètres de vide. Le message doit s’y transformer en molécules pour passer, et vous les voyez traverser.</p>
                                            <p>Ce détour coûteux est ce qui rend le cerveau modifiable : un contact très utilisé se renforce, un contact inutilisé s’efface. C’est le support physique de l’apprentissage et de la mémoire.</p>
                                            <p>C’est aussi la porte d’entrée de presque toute la pharmacologie du cerveau. La caféine y bloque un signal de fatigue, les antidépresseurs y ralentissent le recyclage d’un messager, la nicotine imite une molécule naturelle. Tout se joue dans cet espace.</p>` },
      },
      myeline: {
        label: { e: 'La gaine', a: 'La gaine isolante' },
        e: { title: 'L’accélérateur', html: `<p>Regarde ces manchons enfilés le long du fil, avec des trous réguliers entre eux. Le signal <b>saute</b> de trou en trou au lieu de ramper, et il va cent fois plus vite.</p>` },
        a: { title: 'La gaine isolante', html: `<p>Un manchon gras enroulé autour de la fibre, interrompu à intervalles réguliers. Le signal ne rampe plus le long du fil : il <b>saute</b> d’une interruption à l’autre. Résultat, cent fois plus vite, pour moins d’énergie et moins de place.</p>
                                                <p>C’est cette gaine que le système immunitaire attaque dans la sclérose en plaques. Les fibres restent intactes mais conduisent mal, d’où des symptômes très variés selon les fibres touchées, et évoluant par poussées.</p>
                                                <p>Elle se met en place lentement. Sa maturation n’est achevée qu’à la fin de l’adolescence, en particulier à l’avant du cerveau.</p>` },
      },
      glie: {
        label: { e: 'Les aides', a: 'Les cellules de soutien' },
        e: { title: 'Les nourrices', html: `<p>Autour des neurones vivent d’autres cellules qui les <b>nourrissent</b>, font le ménage et règlent la circulation du sang là où le cerveau travaille.</p>` },
        a: { title: 'Les cellules de soutien', html: `<p>Aussi nombreuses que les neurones, longtemps considérées comme du simple remplissage. Elles nettoient l’espace entre les cellules, recyclent les messagers, nourrissent les neurones, et contrôlent ce qui a le droit de passer du sang vers le cerveau.</p>
                                                      <p>Elles commandent aussi l’afflux de sang là où l’activité augmente, et c’est exactement ce que mesure une IRM fonctionnelle. Les images colorées du cerveau qui pense ne montrent pas des neurones : elles montrent du <b>débit sanguin</b>.</p>` },
      },
    },
    quiz: {
      e: { q: 'Comment un message passe-t-il d’un neurone à l’autre ?', opts: ['Par de petites gouttes chimiques', 'Par une étincelle qui saute', 'Ils se touchent et se collent'], ok: 0,
           fb: 'Oui ! Un espace minuscule sépare les neurones, et le message le franchit sous forme <b>chimique</b>.' },
      a: { q: 'Que montrent réellement les images colorées d’IRM fonctionnelle ?', opts: ['Des variations de débit sanguin local', 'L’activité électrique des neurones', 'La quantité de neurotransmetteurs'], ok: 0,
           fb: 'Du <b>sang</b>, pas des neurones. Les cellules de soutien augmentent l’irrigation là où l’activité monte, et c’est ce signal indirect que l’appareil mesure, avec quelques secondes de retard.' },
    },
  },

  /* ══════════════════ 11 ══════════════════ */
  {
    id: 'cellule', accent: '#5fe0c8', map: [50, 140],
    name: { e: 'La cellule', a: 'La cellule et l’ADN' },
    sub: { e: 'Le monde secret', a: 'Deux mètres dans une bille' },
    fog: { color: 0x061a1c, density: 0.0012 },
    link: {
      e: 'Depuis le début, tout ce qu’on a vu était fait de la même brique. Dernière escale : on entre dans une seule.',
      a: 'Peau, sang, muscle, neurone : dix escales sur le même matériau de base, jamais regardé de près. On entre dans une seule cellule, et dans la bibliothèque qu’elle protège.',
    },
    intro: {
      e: 'Dernière escale, la plus petite et la plus incroyable. Nous entrons <b>dans une seule cellule</b>. Devant nous, son coffre-fort : le noyau.',
      a: 'Dernière escale, la plus petite. Nous sommes <b>dans une seule cellule</b>. Devant vous, son noyau, et les deux mètres d’ADN qui y tiennent.',
    },
    card: {
      e: {
        kicker: 'Escale 11', title: 'Deux mètres de plan dans une bille invisible',
        html: `<p>Ton corps est fait d’environ <b>trente mille milliards</b> de cellules. Chacune est une petite ville : des centrales, des usines, des routes, et une bibliothèque centrale.</p>
               <p>Dans le noyau se trouve ton <b>ADN</b>, une échelle en spirale qui, dépliée, mesurerait <em>deux mètres</em>. Et pourtant elle tient dans quelque chose d’invisible à l’œil nu.</p>
               <p>Cette échelle est le mode d’emploi complet pour te fabriquer. Et il y en a une copie <b>dans presque chacune</b> de tes cellules.</p>`,
        stats: [['30 000 milliards', 'de cellules dans ton corps'],
                ['2 mètres', 'd’ADN plié dans chaque noyau'],
                ['3,2 milliards', 'de lettres dans ton mode d’emploi'],
                ['99,9 %', 'd’ADN identique à celui de ton voisin']],
      },
      a: {
        kicker: 'Escale 11', title: 'Le même texte, lu différemment partout',
        html: `<p>Trente mille milliards de cellules, et à peu près autant de bactéries qui vous accompagnent. Chacune de vos cellules contient <b>le même ADN</b>, le texte intégral. Un neurone et une cellule de foie ne diffèrent pas par le texte mais par les pages qu’ils lisent.</p>
               <p>Deux mètres de fil, dans un noyau de six millièmes de millimètre. À l’échelle, c’est comme ranger quarante kilomètres de fil dans une balle de tennis, sans nœud, et en gardant chaque passage accessible à la lecture.</p>
               <p>Sur 3,2 milliards de lettres, à peine 20 000 recettes de protéines. Presque tout le reste sert à décider <b>quand</b> et <b>où</b> lire ces recettes. C’est la partie la plus intéressante, et la moins connue.</p>
               <p>Une dernière chose. Les centrales énergétiques de vos cellules ont leur propre ADN, différent du vôtre et plus proche de celui d’une bactérie. Ce sont les descendantes d’un organisme libre, avalé sans être digéré il y a un milliard et demi d’années. Vous les tenez <b>toutes de votre mère</b> : le spermatozoïde n’en transmet aucune.</p>`,
        stats: [['30 000 milliards', 'de cellules'],
                ['2 mètres', 'd’ADN dans chaque noyau'],
                ['20 000', 'gènes seulement, sur 3,2 milliards de lettres'],
                ['1,5 milliard d’années', 'depuis l’absorption des mitochondries']],
      },
    },
    spots: {
      noyau: {
        label: { e: 'Le coffre-fort', a: 'Le noyau' },
        e: { title: 'La bibliothèque', html: `<p>Le noyau protège le plan de fabrication. Rien n’en sort directement : la cellule en fait des <b>photocopies</b> qu’elle envoie travailler dehors.</p>` },
        a: { title: 'Le noyau', html: `<p>Une double membrane percée de milliers de portes qui trient ce qui entre et ce qui sort. L’original ne sort jamais : la cellule en fait des copies de travail, qu’elle envoie aux ateliers.</p>
                                       <p>Ce détour n’est pas une perte de temps. Entre la copie et son utilisation, la cellule peut découper et recoller les morceaux dans différents ordres, et fabriquer plusieurs protéines différentes à partir d’un seul gène. C’est en grande partie pourquoi 20 000 gènes suffisent à faire un être humain.</p>` },
      },
      adn: {
        label: { e: 'L’ADN', a: 'La double hélice' },
        e: { title: 'L’échelle en spirale', html: `<p>Une échelle tordue dont les barreaux ne se combinent que par paires : <b>A avec T</b>, <b>C avec G</b>. Toujours. C’est ce qui permet de la copier sans erreur.</p>` },
        a: { title: 'La double hélice', html: `<p>Deux brins enroulés, dont les barreaux ne s’assemblent que par paires fixes : A avec T, C avec G. Toujours.</p>
                                               <p>Cette contrainte est toute l’astuce. Chaque brin contient l’information nécessaire pour reconstruire l’autre : il suffit d’ouvrir la fermeture éclair et de compléter. C’est pour cela que la molécule se copie, et donc que l’hérédité existe.</p>
                                               <p>Le taux d’erreur final est d’environ une sur un milliard, après plusieurs étapes de relecture. Les erreurs qui passent sont à la fois la cause des cancers et le moteur de l’évolution.</p>` },
      },
      mito: {
        label: { e: 'Les centrales', a: 'Les centrales' },
        e: { title: 'Les piles de la cellule', html: `<p>Ces haricots fabriquent l’<b>énergie</b>. Plus une cellule travaille, plus elle en contient : une cellule de cœur en est bourrée.</p>` },
        a: { title: 'Les centrales', html: `<p>Elles produisent la molécule qui alimente tout le reste. Vous en consommez et en régénérez l’équivalent de votre propre poids chaque jour, car le stock ne dure que quelques secondes.</p>
                                            <p>Leur nombre suit la demande : quelques dizaines dans une cellule de peau, plusieurs milliers dans une cellule de cœur.</p>
                                            <p>Et elles ont leur propre ADN, circulaire, hérité uniquement de votre mère. C’est ce qui permet de remonter les lignées maternelles sur des dizaines de milliers d’années.</p>` },
      },
      ribosome: {
        label: { e: 'Les ateliers', a: 'Les ateliers' },
        e: { title: 'Les assembleurs', html: `<p>Ils lisent la photocopie du plan et assemblent les <b>protéines</b> morceau par morceau, comme on enfile des perles, plusieurs par seconde.</p>` },
        a: { title: 'Les ateliers', html: `<p>Ils lisent la copie de travail trois lettres à la fois et enfilent l’acide aminé correspondant. Une dizaine par seconde, sans interruption.</p>
                                           <p>Ceux des bactéries sont construits différemment des vôtres. C’est précisément cette différence qu’exploitent de nombreux <b>antibiotiques</b> : ils bloquent l’atelier bactérien sans toucher au vôtre. Toute l’antibiothérapie repose sur des écarts de ce genre.</p>` },
      },
    },
    quiz: {
      e: { q: 'Quelle longueur d’ADN se cache dans une seule de tes cellules ?', opts: ['Environ 2 mètres', 'Environ 2 millimètres', 'Environ 2 kilomètres'], ok: 0,
           fb: '<b>Deux mètres</b>, pliés dans un noyau de quelques millièmes de millimètre. Un chef-d’œuvre de rangement.' },
      a: { q: 'Comment 20 000 gènes suffisent-ils à fabriquer un être humain ?', opts: ['Un gène peut donner plusieurs protéines différentes', 'Chaque gène est très long', 'Les gènes se dupliquent en permanence'], ok: 0,
           fb: 'La copie de travail est <b>découpée et recollée</b> dans différents ordres selon les besoins : un même gène peut produire des dizaines de protéines. L’essentiel du génome ne code rien, il régule.' },
    },
  },
];

/* Petit sélecteur bilingue : t({e,a}, age). */
export const t = (obj, age) => (obj == null ? '' : (typeof obj === 'string' ? obj : (obj[age === 'enfant' ? 'e' : 'a'] ?? obj.a ?? obj.e ?? '')));

export const FINALE = {
  e: {
    title: 'Voyage terminé !',
    html: `<p>Tu viens de traverser <b>onze mondes</b>, et tout ça se trouve à l’intérieur de toi, en ce moment même.</p>
           <p>Souviens-toi du trajet : on est entré par un pore, on s’est laissé porter par le sang jusqu’au cœur, le cœur nous a envoyés aux poumons, puis on est allé voir d’où vient la nourriture, où elle est triée, où les déchets sortent, à quoi sert toute cette énergie, et qui commande.</p>
           <p>Pendant que tu lisais cette phrase, ton cœur a battu, tes poumons ont pris de l’air, ta moelle a fabriqué des millions de globules rouges et des milliards de neurones se sont parlé.</p>
           <p>Sans que tu aies rien eu à faire.</p>`,
  },
  a: {
    title: 'Fin du parcours',
    html: `<p>Onze escales, de la peau à l’ADN. Du mètre au nanomètre, six ordres de grandeur.</p>
           <p>Le trajet avait une logique. On est entré par la seule porte disponible, on a suivi le transport jusqu’à la pompe, la pompe jusqu’au poumon, puis on a remonté la chaîne du carburant : l’estomac, l’intestin, le foie. Ensuite le rein, qui jette. Puis les os et les muscles, qui consomment. Puis le cerveau, qui coordonne. Et pour finir, l’unité dont tout le reste est fait.</p>
           <p>Le plus frappant n’est pas chaque organe pris à part, mais la façon dont ils se tiennent. Le rein règle la tension et commande à la moelle de fabriquer des globules. La moelle alimente les poumons en transporteurs. Les poumons alimentent un cerveau incapable de stocker son carburant. Le foie tient ce cerveau en vie entre deux repas.</p>
           <p>Personne ne dirige. Il n’y a pas de chef d’orchestre, pas de plan central, seulement des boucles de régulation qui se corrigent les unes les autres, en permanence, depuis le jour de votre naissance.</p>`,
  },
};
