/**
 * Missions, récoltes et reliques — la raison de fouiller chaque escale.
 *
 * Trois missions par escale : une qui oblige à aller quelque part, une qui
 * oblige à lire ou à répondre, une qui oblige à écumer le volume. La relique
 * est posée près des limites, sans repère ni indication : on ne la trouve
 * qu'en s'écartant vraiment.
 *
 *   type 'reach'   → approcher un repère
 *   type 'read'    → ouvrir la fiche d'un repère
 *   type 'collect' → ramasser N échantillons
 *   type 'quiz'    → répondre à la question de l'escale
 */
export const MISSIONS = {
  peau: {
    samples: 7, pickRadius: 62, orb: 0xffd07a, relicColor: 0xff86c8,
    sample: { e: 'grain de poussière', a: 'squame' },
    missions: [
      { id: 'sommet', type: 'reach', spot: 'poil', r: 190, label: { e: 'Monte tout en haut d’un poil', a: 'Rejoindre le sommet d’un poil' } },
      { id: 'pore', type: 'read', spot: 'pore', label: { e: 'Va voir d’où sort la sueur', a: 'Ouvrir la fiche du pore' } },
      { id: 'recolte', type: 'collect', n: 7, label: { e: 'Ramasse 7 grains de poussière', a: 'Prélever 7 squames' } },
    ],
    relic: {
      title: { e: 'Le grain de beauté', a: 'Le grain de beauté' },
      html: {
        e: '<p>Tu as trouvé un endroit où les cellules qui fabriquent la couleur se sont installées toutes au même endroit, en petit groupe. Ça fait une tache brune. Tout le monde en a — en moyenne une trentaine.</p>',
        a: '<p>Un amas de cellules pigmentaires réunies au même endroit au lieu d’être réparties. Un adulte en porte une trentaine. Celui qui change de forme, de couleur ou de taille est le seul qui mérite qu’on le montre à un médecin.</p>',
      },
    },
  },

  sang: {
    samples: 8, pickRadius: 15, orb: 0xffb0b8, relicColor: 0xffe07a,
    sample: { e: 'bulle d’oxygène', a: 'molécule d’oxygène' },
    missions: [
      { id: 'paroi', type: 'reach', spot: 'paroi', r: 40, label: { e: 'Va toucher le mur du tuyau', a: 'Approcher la paroi du vaisseau' } },
      { id: 'quiz', type: 'quiz', label: { e: 'Réponds à la question de l’escale', a: 'Répondre à la question de l’escale' } },
      { id: 'recolte', type: 'collect', n: 8, label: { e: 'Attrape 8 bulles d’oxygène', a: 'Capter 8 molécules d’oxygène' } },
    ],
    relic: {
      title: { e: 'Le caillot', a: 'Le caillot' },
      html: {
        e: '<p>Un bouchon ! Quand tu te coupes, des milliers de petites plaquettes se collent ensemble pour boucher le trou. C’est ce qui fait la croûte sur un genou écorché.</p>',
        a: '<p>Un bouchon de plaquettes prises dans un filet de fibres. C’est ce qui arrête un saignement — et, formé au mauvais endroit, exactement ce qui bouche une artère.</p>',
      },
    },
  },

  coeur: {
    samples: 6, pickRadius: 26, orb: 0xff9a8a, relicColor: 0xffd86a,
    sample: { e: 'goutte de sang', a: 'volume d’éjection' },
    missions: [
      { id: 'valve', type: 'reach', spot: 'valve', r: 90, label: { e: 'Approche-toi de la grande porte', a: 'Approcher la valve mitrale' } },
      { id: 'myocarde', type: 'read', spot: 'myocarde', label: { e: 'Découvre le muscle qui pousse', a: 'Ouvrir la fiche du muscle cardiaque' } },
      { id: 'recolte', type: 'collect', n: 6, label: { e: 'Suis 6 gouttes de sang', a: 'Suivre 6 volumes éjectés' } },
    ],
    relic: {
      title: { e: 'Le trou qui s’est refermé', a: 'Le foramen ovale' },
      html: {
        e: '<p>Avant ta naissance, tu ne respirais pas : tu prenais l’oxygène de ta mère. Le sang n’avait donc rien à faire dans tes poumons, et un petit trou lui permettait de couper au plus court entre les deux moitiés du cœur. À ta première inspiration, il s’est refermé.</p>',
        a: '<p>Avant la naissance, les poumons ne servent à rien : l’oxygène vient du placenta. Un passage entre les deux oreillettes laisse donc le sang court-circuiter le circuit pulmonaire. La première inspiration inverse les pressions et le rabat se plaque. Chez une personne sur quatre il ne se soude jamais complètement, en général sans aucune conséquence.</p>',
      },
    },
  },

  poumons: {
    samples: 8, pickRadius: 55, orb: 0x9fe4ff, relicColor: 0xffd0a0,
    sample: { e: 'bulle d’air', a: 'bouffée d’air' },
    missions: [
      { id: 'alveole', type: 'reach', spot: 'alveole', r: 150, label: { e: 'Entre dans une bulle', a: 'Entrer dans un sac alvéolaire' } },
      { id: 'capillaire', type: 'read', spot: 'capillaire', label: { e: 'Regarde le tuyau rouge autour', a: 'Ouvrir la fiche du capillaire' } },
      { id: 'recolte', type: 'collect', n: 8, label: { e: 'Attrape 8 bulles d’air', a: 'Capter 8 bouffées d’air' } },
    ],
    relic: {
      title: { e: 'Le hoquet', a: 'Le hoquet' },
      html: {
        e: '<p>Le grand muscle sous tes poumons s’appelle le diaphragme. Parfois il se contracte tout seul, d’un coup, et l’air entre brutalement : la porte de ta gorge claque, et ça fait « hic ».</p>',
        a: '<p>Une contraction involontaire du diaphragme aspire brutalement de l’air, et la glotte se referme dessus au bout de trente-cinq millièmes de seconde. Le bruit, c’est ce claquement. Personne n’a d’explication satisfaisante à son utilité.</p>',
      },
    },
  },

  estomac: {
    samples: 7, pickRadius: 46, orb: 0xffd070, relicColor: 0xa0ff90,
    sample: { e: 'morceau de repas', a: 'fragment de bol alimentaire' },
    missions: [
      { id: 'acide', type: 'reach', spot: 'acide', r: 130, label: { e: 'Trouve d’où sort l’acide', a: 'Trouver une glande à acide' } },
      { id: 'mucus', type: 'read', spot: 'mucus', label: { e: 'Découvre le bouclier gluant', a: 'Ouvrir la fiche du mucus' } },
      { id: 'recolte', type: 'collect', n: 7, label: { e: 'Ramasse 7 morceaux de repas', a: 'Prélever 7 fragments' } },
    ],
    relic: {
      title: { e: 'Le gargouillis', a: 'Le gargouillis' },
      html: {
        e: '<p>Ce bruit de ventre qui grogne, ce n’est pas la faim : c’est de l’air et du liquide brassés par les muscles de ton tube digestif. Ça marche même quand tu viens de manger — c’est juste plus silencieux quand il y a de quoi amortir.</p>',
        a: '<p>Ce n’est pas la faim qui fait ce bruit, c’est le brassage : les muscles poussent air et liquide dans un tube presque vide, sans rien pour amortir. Le ventre gargouille aussi après un repas, mais le contenu étouffe le son.</p>',
      },
    },
  },

  intestin: {
    samples: 8, pickRadius: 30, orb: 0xffd07a, relicColor: 0x90ffc0,
    sample: { e: 'nutriment', a: 'nutriment' },
    missions: [
      { id: 'villosite', type: 'reach', spot: 'villosite', r: 70, label: { e: 'Approche une des petites tours', a: 'Approcher une villosité' } },
      { id: 'microbiote', type: 'read', spot: 'microbiote', label: { e: 'Rencontre tes bactéries', a: 'Ouvrir la fiche du microbiote' } },
      { id: 'recolte', type: 'collect', n: 8, label: { e: 'Attrape 8 nutriments', a: 'Capter 8 nutriments' } },
    ],
    relic: {
      title: { e: 'L’appendice', a: 'L’appendice' },
      html: {
        e: '<p>Un petit doigt fermé au bout du gros intestin. Longtemps on a cru qu’il ne servait à rien. On pense aujourd’hui qu’il sert de garde-manger à tes bonnes bactéries : après une grosse diarrhée, elles ressortent de là pour tout repeupler.</p>',
        a: '<p>Longtemps considéré comme un vestige inutile. L’hypothèse tenue aujourd’hui : un refuge à bactéries. Après un épisode qui vide le côlon, la flore repart de cette réserve. Ce qui n’empêche pas de l’enlever quand il s’infecte.</p>',
      },
    },
  },

  foie: {
    samples: 7, pickRadius: 48, orb: 0xffb060, relicColor: 0xa8e0ff,
    sample: { e: 'toxine', a: 'molécule à traiter' },
    missions: [
      { id: 'lobule', type: 'reach', spot: 'lobule', r: 140, label: { e: 'Entre dans un atelier hexagonal', a: 'Entrer dans un lobule' } },
      { id: 'bile', type: 'read', spot: 'bile', label: { e: 'Trouve le liquide vert', a: 'Ouvrir la fiche de la bile' } },
      { id: 'recolte', type: 'collect', n: 7, label: { e: 'Nettoie 7 toxines', a: 'Traiter 7 molécules' } },
    ],
    relic: {
      title: { e: 'Le foie qui repousse', a: 'La régénération' },
      html: {
        e: '<p>Tu as trouvé une zone en train de se reconstruire. Le foie est le seul organe capable de repousser : on peut lui en enlever la moitié, il refait sa taille en quelques semaines.</p>',
        a: '<p>Le seul organe humain qui se régénère vraiment. Amputé de deux tiers, il retrouve sa masse en quelques semaines — c’est ce qui rend possible le don de foie entre vivants. La forme d’origine, elle, ne revient pas.</p>',
      },
    },
  },

  rein: {
    samples: 7, pickRadius: 55, orb: 0xa8d0ff, relicColor: 0xffd070,
    sample: { e: 'déchet', a: 'déchet filtré' },
    missions: [
      { id: 'glomerule', type: 'reach', spot: 'glomerule', r: 150, label: { e: 'Approche la pelote de tuyaux', a: 'Approcher le glomérule' } },
      { id: 'henle', type: 'read', spot: 'henle', label: { e: 'Suis le grand virage', a: 'Ouvrir la fiche de l’anse' } },
      { id: 'recolte', type: 'collect', n: 7, label: { e: 'Filtre 7 déchets', a: 'Filtrer 7 déchets' } },
    ],
    relic: {
      title: { e: 'Le caillou', a: 'Le calcul rénal' },
      html: {
        e: '<p>Un petit caillou ! Quand on ne boit pas assez, certains déchets n’ont plus assez d’eau pour rester dissous et forment des cristaux. Ça grossit, et ça fait très mal quand ça descend.</p>',
        a: '<p>Des sels qui n’ont plus assez d’eau pour rester dissous cristallisent. Le passage dans l’uretère est régulièrement décrit comme la douleur la plus intense qu’on puisse ressentir. La prévention tient en un mot : boire.</p>',
      },
    },
  },

  charpente: {
    samples: 7, pickRadius: 75, orb: 0xffe0b0, relicColor: 0xff90a0,
    sample: { e: 'cristal de calcium', a: 'cristal de calcium' },
    missions: [
      { id: 'moelle', type: 'reach', spot: 'moelle', r: 200, label: { e: 'Va voir l’usine à sang', a: 'Rejoindre la moelle' } },
      { id: 'fibre', type: 'read', spot: 'fibre', label: { e: 'Découvre comment un muscle tire', a: 'Ouvrir la fiche de la fibre' } },
      { id: 'recolte', type: 'collect', n: 7, label: { e: 'Récolte 7 cristaux', a: 'Prélever 7 cristaux' } },
    ],
    relic: {
      title: { e: 'L’os qui se refabrique', a: 'Le remodelage osseux' },
      html: {
        e: '<p>Ton squelette n’est pas figé. Des cellules démolissent l’os en permanence et d’autres le reconstruisent. En une dizaine d’années, tout est remplacé : ce n’est plus le même squelette qu’à ta naissance.</p>',
        a: '<p>Deux populations de cellules travaillent en permanence : les unes creusent, les autres reconstruisent. Le squelette est intégralement renouvelé en une dizaine d’années. C’est aussi pour ça qu’il s’adapte à la charge — et qu’il fond quand on ne s’en sert plus.</p>',
      },
    },
  },

  cerveau: {
    samples: 8, pickRadius: 85, orb: 0xa8e8ff, relicColor: 0xffb0ff,
    sample: { e: 'message électrique', a: 'influx nerveux' },
    missions: [
      { id: 'neurone', type: 'reach', spot: 'neurone', r: 220, label: { e: 'Approche le corps d’un neurone', a: 'Approcher un corps cellulaire' } },
      { id: 'synapse', type: 'read', spot: 'synapse', label: { e: 'Regarde comment deux neurones se parlent', a: 'Ouvrir la fiche de la synapse' } },
      { id: 'recolte', type: 'collect', n: 8, label: { e: 'Attrape 8 messages', a: 'Capter 8 influx' } },
    ],
    relic: {
      title: { e: 'Le souvenir', a: 'La trace mnésique' },
      html: {
        e: '<p>Un souvenir n’est pas rangé quelque part comme un fichier. C’est un groupe de neurones qui ont pris l’habitude de s’allumer ensemble. Se souvenir, c’est les rallumer — et à chaque fois, ça les modifie un peu.</p>',
        a: '<p>Un souvenir n’est pas stocké, il est reconstruit. Un groupe de neurones a renforcé ses liaisons ; se souvenir, c’est les réactiver, et cette réactivation les remanie. C’est pourquoi un souvenir souvent raconté finit par s’éloigner de ce qui a eu lieu.</p>',
      },
    },
  },

  cellule: {
    samples: 8, pickRadius: 72, orb: 0x9fe0ff, relicColor: 0xffc86a,
    sample: { e: 'brique de construction', a: 'acide aminé' },
    missions: [
      { id: 'adn', type: 'reach', spot: 'adn', r: 190, label: { e: 'Approche la grande échelle torsadée', a: 'Approcher la double hélice' } },
      { id: 'mito', type: 'read', spot: 'mito', label: { e: 'Trouve la centrale électrique', a: 'Ouvrir la fiche de la mitochondrie' } },
      { id: 'recolte', type: 'collect', n: 8, label: { e: 'Ramasse 8 briques', a: 'Prélever 8 acides aminés' } },
    ],
    relic: {
      title: { e: 'La bactérie avalée', a: 'L’endosymbiose' },
      html: {
        e: '<p>Les centrales électriques de tes cellules ont leur propre ADN, différent du tien. Parce qu’il y a très longtemps, c’étaient des bactéries libres. Une grosse cellule en a avalé une sans la digérer, et elles ne se sont plus jamais quittées.</p>',
        a: '<p>Les mitochondries ont leur propre ADN, circulaire, plus proche de celui d’une bactérie que du vôtre. Elles descendent d’un organisme libre avalé sans être digéré, il y a environ un milliard et demi d’années. Vous les tenez toutes de votre mère : le spermatozoïde n’en transmet pas.</p>',
      },
    },
  },
};
