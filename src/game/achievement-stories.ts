import type { Achievement } from './achievements';

export type AchievementStory = Readonly<{ en: string; es: string }>;

const stories: Record<string, AchievementStory> = {
  'first-thread': { en: 'One brave tug, and the yarn decided to trust you.', es: 'Un tirón valiente y la lana decidió confiar en ti.' },
  'persistent-paws': { en: 'Your paws kept going. The ball of yarn is quietly impressed.', es: 'Tus patas siguieron. El ovillo está discretamente impresionado.' },
  'paw-marathon': { en: 'Somewhere, a tiny coach blows a whistle and offers you a biscuit.', es: 'En algún lugar, un pequeño entrenador silba y te ofrece una galleta.' },
  'thread-legend': { en: 'The yarn now tells campfire stories about your determination.', es: 'La lana ya cuenta historias junto al fuego sobre tu determinación.' },
  'first-skein': { en: 'A proper skein! It sits proudly where the sun reaches the floor.', es: '¡Una madeja de verdad! Descansa orgullosa donde llega el sol.' },
  'woolly-ambition': { en: 'Your workshop has begun to smell faintly of wool and victory.', es: 'Tu taller empieza a oler un poco a lana y victoria.' },
  'thread-empire': { en: 'The cats call it an empire. You call it a very organized pile.', es: 'Los gatos lo llaman imperio. Tú lo llamas una pila muy ordenada.' },
  'million-meows': { en: 'One million little meows echo through the rafters, all in tune.', es: 'Un millón de pequeños maullidos resuenan en las vigas, todos afinados.' },
  'cosmic-skein': { en: 'A star mistakes your yarn for a constellation and waves politely.', es: 'Una estrella confunde tu lana con una constelación y saluda con educación.' },
  'first-hire': { en: 'A new colleague arrives, bringing exactly zero paperwork.', es: 'Llega un nuevo colega, con exactamente cero papeles.' },
  'cat-party': { en: 'Ten cats share one plan: nap first, knit magnificently later.', es: 'Diez gatos comparten un plan: siesta primero, tejer magníficamente después.' },
  'crowded-sofa': { en: 'The sofa has vanished beneath a warm, purring committee.', es: 'El sofá desapareció bajo un comité cálido y ronroneante.' },
  'fluffy-thousand': { en: 'A thousand tails make the workshop look pleasantly windy.', es: 'Mil colas hacen que el taller parezca agradablemente ventoso.' },
  'cat-city': { en: 'Your city runs on yarn, naps, and impeccable municipal purring.', es: 'Tu ciudad funciona con lana, siestas y ronroneos municipales impecables.' },
  'mixed-company': { en: 'Different paws, one shared snack break. Teamwork has never been softer.', es: 'Patas distintas, una misma pausa para comer. El trabajo en equipo nunca fue tan suave.' },
  'full-house': { en: 'Every corner has a specialist, including the corner inspector.', es: 'Cada rincón tiene un especialista, incluso el inspector de rincones.' },
  'ten-lives': { en: 'All ten crews gather for a portrait. Only three look at the camera.', es: 'Los diez equipos se reúnen para un retrato. Solo tres miran a la cámara.' },
  'first-upgrade': { en: 'A sticky note becomes destiny with one very confident pawprint.', es: 'Una nota adhesiva se vuelve destino con una huella muy segura.' },
  'toolbox': { en: 'The toolbox purrs. Nobody asks how it learned.', es: 'La caja de herramientas ronronea. Nadie pregunta cómo aprendió.' },
  'serial-tinkerer': { en: 'You have adjusted everything except the cat who insists on supervising.', es: 'Has ajustado todo salvo al gato que insiste en supervisar.' },
  'professor-purr': { en: 'Your honorary degree arrives wrapped in a suspiciously fuzzy envelope.', es: 'Tu título honorario llega en un sobre sospechosamente peludo.' },
  'fresh-start': { en: 'A new chapter opens like a sunny window after a long nap.', es: 'Un capítulo nuevo se abre como una ventana soleada tras una larga siesta.' },
  'third-time': { en: 'Third time is indeed a purr: the cats had a feeling.', es: 'A la tercera va la vencida: los gatos lo presentían.' },
  'nine-lives': { en: 'Nine new doors, nine welcome mats, and one very pleased cat.', es: 'Nueve puertas nuevas, nueve felpudos y un gato muy satisfecho.' },
  'divine-favor': { en: 'A gentle blessing lands on the workshop like a warm sunbeam.', es: 'Una bendición suave cae sobre el taller como un rayo de sol tibio.' },
  demigod: { en: 'The gods nod approvingly, then ask whether dinner is ready.', es: 'Los dioses asienten con aprobación y luego preguntan si ya está la cena.' },
  pantheon: { en: 'The whole pantheon purrs at once. It is louder than thunder.', es: 'Todo el panteón ronronea a la vez. Suena más fuerte que un trueno.' },
  'hello-friend': { en: 'A new friend curls up nearby as if they have always belonged.', es: 'Un nuevo amigo se acurruca cerca como si siempre hubiera pertenecido allí.' },
  'friend-circle': { en: 'Three friends make a circle large enough for every secret and snack.', es: 'Tres amigos forman un círculo para cada secreto y cada bocadillo.' },
  'whole-family': { en: 'The family photo is blurry, perfect, and full of whiskers.', es: 'La foto familiar sale borrosa, perfecta y llena de bigotes.' },
  'new-look': { en: 'A fresh face leads the workshop, with a little extra swagger.', es: 'Una cara nueva guía el taller, con un poquito más de estilo.' },
  'while-you-napped': { en: 'While you dreamed, the cats kept the lamps glowing and the yarn growing.', es: 'Mientras soñabas, los gatos mantuvieron las lámparas encendidas y la lana creciendo.' },
  'dream-shift': { en: 'The night shift leaves a tiny note: “Everything is cozy.”', es: 'El turno nocturno deja una nota pequeña: «Todo está acogedor».' },
  'cozy-hour': { en: 'An hour together turns ordinary work into a favorite memory.', es: 'Una hora juntos convierte el trabajo cotidiano en un recuerdo favorito.' },
  'group-hug': { en: 'Ten new friends arrive at once. The welcome hug takes a while.', es: 'Diez amigos nuevos llegan a la vez. El abrazo de bienvenida tarda un rato.' },
  'all-in': { en: 'Every available paw votes yes. The yarn ball approves unanimously.', es: 'Cada pata disponible vota que sí. El ovillo aprueba por unanimidad.' },
};

export function achievementStory(id: Achievement['id'] | string, language: 'en' | 'es'): string {
  const story = stories[id];
  return story ? story[language] : '';
}
