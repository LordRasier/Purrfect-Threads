import type { Copy } from './copy';
import { PRODUCERS, PRODUCER_UPGRADES } from '../game/catalog';

export type Language = 'en' | 'es';
let language: Language = 'en';

const sourceCatalog: Record<string, string> = {
  'Drag the board. Hover or focus a note; tap for details.': 'Arrastra el tablero. Pasa el cursor o enfoca una nota; tócala para ver detalles.',
  'Move the upgrade board': 'Mover el tablero de mejoras', 'Zoom the upgrade board': 'Acercar el tablero de mejoras', 'Zoom out': 'Alejar', 'Zoom in': 'Acercar', 'Fit all upgrades': 'Ver todas las mejoras', 'Fit': 'Ver todo',
  'Pan left': 'Mover a la izquierda', 'Pan right': 'Mover a la derecha',
  'Pan up': 'Mover hacia arriba', 'Pan down': 'Mover hacia abajo',
  'Center on Helping Thread': 'Centrar en Hilo de ayuda',
  'Helping Thread': 'Hilo de ayuda',
  'Hold the yarn ball or Space to keep pulling, five times a second.': 'Mantén presionado el ovillo o Espacio para seguir tirando, cinco veces por segundo.',
  'Requires:': 'Requiere:', 'Ready to learn': 'Disponible para aprender',
  'Upgrade tree': 'Árbol de mejoras',
  'Start with Helping Thread. Follow the red strings to grow your workshop.': 'Empieza con Hilo de ayuda. Sigue los hilos rojos para mejorar tu taller.',
  'Scroll the board to explore. Select a note for details.': 'Desplaza el tablero para explorar. Selecciona una nota para ver los detalles.',
  'Tap the yarn to pull a thread': 'Toca el ovillo para tirar de un hilo',
  'Unlock Helping Thread to hold the yarn or Space': 'Desbloquea Hilo de ayuda para mantener el ovillo o Espacio',
  'Shop': 'Tienda',
  'A LITTLE EXTRA HELP': 'UN POCO DE AYUDA EXTRA',
  'An optional helping paw. Your workshop is always free to play.': 'Una ayuda opcional. Tu taller siempre se puede jugar gratis.',
  '12 REAL HOURS': '12 HORAS REALES',
  'Three cat contractors with sunglasses, blueprints and tools': 'Tres gatos contratistas con gafas de sol, planos y herramientas',
  'MEET YOUR CONTRACTORS': 'CONOCE A TUS CONTRATISTAS',
  'Meowtastic Crew': 'Equipo Miautástico',
  'Big plans. Tiny paws. Double the teamwork.': 'Grandes planes. Patitas pequeñas. El doble de trabajo en equipo.',
  'When efficiency calls, these three answer. They bring tools, blueprints and enough confidence to supervise the supervisor. Hard hats on; nap breaks negotiable.': 'Cuando hace falta eficiencia, estos tres responden. Llegan con herramientas, planos y confianza de sobra para supervisar al supervisor. Cascos puestos; las siestas se negocian.',
  'automatic production': 'producción automática',
  'For 12 real hours from confirmed purchase, including time away. The timer keeps running while the game is closed.': 'Durante 12 horas reales desde la compra confirmada, incluido el tiempo sin conexión. El tiempo sigue corriendo con el juego cerrado.',
  'Survives chapter restarts.': 'Se conserva al reiniciar el capítulo.',
  'No stacking. Buy again only after the boost expires.': 'No se acumula. Solo se puede volver a comprar cuando termina.',
  'Does not multiply taps or the +5 yarn cat reward.': 'No multiplica los toques ni la recompensa de +5 de lana del gato.',
  'Offline earnings keep their usual 8-hour cap and 50% rate (65% with Roman).': 'La producción sin conexión conserva su límite de 8 horas y su tasa del 50% (65% con Roman).',
  'Base reference price': 'Precio base de referencia',
  'The final local price will be shown by Google Play before payment.': 'Google Play mostrará el precio local final antes del pago.',
  'Coming soon': 'Próximamente',
  'Purchases and restore are not available in this build. No charge has been made.': 'Las compras y su restauración no están disponibles en esta versión. No se ha cobrado nada.',
  'Restore purchases': 'Restaurar compras',
  'The backup could not be exported. Your saved game has not been changed.': 'No se pudo exportar la copia. Tu partida guardada no ha cambiado.',
  'Privacy policy': 'Política de privacidad',
  'Tap to enter': 'Toca para entrar',
  'Play': 'Jugar', 'Crew': 'Equipo', 'Badges': 'Logros',
  'Six familiar faces, six little talents. Complete their challenges to welcome them home.': 'Seis caras conocidas, seis pequeños talentos. Completa sus desafíos para darles la bienvenida.',
  'Only your selected companion provides a bonus.': 'Solo el acompañante seleccionado aporta una bonificación.',
  'WHILE SELECTED': 'AL SELECCIONARLO', 'An empty cushion, for now': 'Un cojín vacío, por ahora',
  'The cushion is waiting for your first companion.': 'El cojín espera a tu primer acompañante.',
  'Companion unlock progress': 'Progreso para desbloquear al acompañante', 'Unlocked forever': 'Desbloqueado para siempre',
  'Cats in this chapter': 'Gatos en este capítulo', 'Lifetime touches': 'Toques acumulados',
  'Upgrades purchased': 'Mejoras compradas', 'Offline yarn earned': 'Lana sin conexión', 'Completed restarts': 'Reinicios completados',
  'The grumpy boss. Always has a complaint.': 'La jefa gruñona. Siempre tiene alguna queja.',
  'All cuddles, not a single clever thought.': 'Todo mimos y pocas ideas brillantes.',
  'A sleepy, chubby sweetheart.': 'Gordito, dormilón y muy mimoso.',
  'Fluffy, determined, and a little persistent.': 'Peludo, decidido y un poco insistente.',
  'Tiny paws. The sweetest heart.': 'Patitas pequeñas. Un corazón muy dulce.',
  'A lovable klutz. Trouble follows every step.': 'Un torpe adorable. Cada paso trae una travesura.',
  'All passive production +10%.': '+10% de toda la producción automática.',
  'Manual touches +25%.': '+25% de lana por toque.',
  'Offline production earns 65%.': 'Producción sin conexión al 65% (antes 50%).',
  'Kitten, Basket, and Corner output +30%.': '+30% de producción de Gatitos, Canastas y Tejedores.',
  'Crew prices 5% lower.': 'Equipos un 5% más baratos.',
  'Triple-touch chance +5 percentage points.': '+5 puntos porcentuales de probabilidad de toque triple.',
  'Reach 250 cats and 1,000 lifetime taps.': 'Consigue 250 gatos y acumula 1.000 toques.',
  'Buy 12 upgrades across all chapters.': 'Compra 12 mejoras entre todos los capítulos.',
  'Earn 100,000 yarn while offline.': 'Produce 100.000 de lana sin conexión.',
  'Complete 3 chapters.': 'Completa 3 reinicios.',
  'Reach a population of 5,000 cats.': 'Consigue una población de 5.000 gatos.',
  'Complete 5 chapters and make 5,000 lifetime taps.': 'Completa 5 reinicios y acumula 5.000 toques.',

  'ONLY WHEN YOU RESTART': 'SOLO AL REINICIAR',
  'One restart. One golden paw. Extra yarn never increases the reward.': 'Un reinicio. Una pata dorada. Acumular más lana no aumenta la recompensa.',
  'Chapter restart progress': 'Progreso para reiniciar el capítulo',
  'Chapter complete. Your golden paw is claimed only when you restart.': 'Capítulo completado. Recibes tu pata dorada únicamente al reiniciar.',
  'A permanent blessing. Inspect freely; purchase once.': 'Una bendición permanente. Puedes inspeccionarla y comprarla una sola vez.',
  '3D statues are unavailable. You can still inspect and buy every blessing.': 'Las estatuas 3D no están disponibles. Todavía puedes inspeccionar y comprar cada bendición.',
  'Hera': 'Hera', 'Hermes': 'Hermes', 'Athena': 'Atenea', 'Zeus': 'Zeus', 'Poseidon': 'Poseidón', 'Demeter': 'Deméter', 'Apollo': 'Apolo', 'Artemis': 'Artemisa', 'Ares': 'Ares', 'Aphrodite': 'Afrodita', 'Hephaestus': 'Hefesto', 'Dionysus': 'Dioniso',
  'Thunder Paws': 'Patas del trueno', '+20% yarn from every touch.': '+20% de lana con cada toque.',
  'Tidal Tails': 'Colas de marea', '+20% Kitten and Basket Buddies production.': '+20% de producción de Gatitos y Amigos de la canasta.',
  'Harvest Threads': 'Cosecha de hilos', '+20% Knitter and Artisan Cats production.': '+20% de producción de Gatos tejedores y Gatos artesanos.',
  'Sunlit Spools': 'Carretes solares', '+20% Cloud and Tailor Tabbies production.': '+20% de producción de Gatos nube y Atigrados sastres.',
  'Moon Hunt': 'Caza lunar', '+20% Rainbow Dyers and Spinning Siamese production.': '+20% de producción de Tintoreros arcoíris y Siameses hilanderos.',
  'Warrior Weave': 'Tejido guerrero', '+20% Dream Weavers and Celestial Cats production.': '+20% de producción de Tejedores de sueños y Gatos celestiales.',
  'Love of Labor': 'Amor por el oficio', '+10% all automatic production.': '+10% de toda la producción automática.',
  'Forge of Paws': 'Forja de patas', '+10% automatic production per milestone upgrade. Helping Thread and practice nodes do not count.': '+10% de producción automática por mejora principal. Hilo de ayuda y las prácticas no cuentan.',
  'Joyful Pull': 'Toque alegre', '+10% yarn from every touch.': '+10% de lana con cada toque.',
  'Buy all twelve permanent Olympus talents.': 'Compra los doce talentos permanentes del Olimpo.',
  'PLAYABLE PROTOTYPE · 0.5.0': 'PROTOTIPO JUGABLE · 0.5.0',
  'Prototype safety limit: 10,000 purchases per team type.': 'Límite de seguridad del prototipo: 10.000 compras por tipo de equipo.',
  'A lot of cats.': 'Un montón de gatos.',
  'Upgrades': 'Mejoras', 'Achievements': 'Logros', 'Cats': 'Gatos', 'Olympus': 'Olimpo',
  'THE VERY SERIOUS CAT COMMITTEE': 'EL MUY SERIO COMITÉ FELINO', 'Big ideas. Tiny handwriting.': 'Grandes ideas. Letra diminuta.',
  'Chapter improvements, approved by the head of naps.': 'Mejoras del capítulo, aprobadas por la jefa de las siestas.', 'Please do not eat the sticky notes.': 'Por favor, no te comas las notas adhesivas.',
  'A fresh board in every new chapter.': 'Un tablero nuevo en cada capítulo.', 'Unlocked': 'Desbloqueado', 'In progress': 'En progreso',
  'Little wins, proudly displayed.': 'Pequeños triunfos, orgullosamente exhibidos.', 'A scrapbook of your finest pawprints. Badges stay with you through every chapter.': 'Un álbum de tus mejores huellas. Las insignias te acompañan en cada capítulo.',
  'Achievement category': 'Categoría de logro', 'All achievements': 'Todos los logros',
  'Mount Pawlympus': 'Monte Patalimpo', 'A tiny pantheon for your greatest little ideas. These blessings last forever.': 'Un pequeño panteón para tus mejores ideas. Estas bendiciones duran para siempre.',
  'Permanent blessings': 'Bendiciones permanentes', 'Keeper of the hearth': 'Guardiana del hogar', 'Patron of helping paws': 'Patrón de las patas ayudantes', 'Master of the golden thread': 'Maestra del hilo dorado', '10 specialized cat crews': '10 equipos felinos especializados', 'Master Knitters blessing required': 'Se requiere la bendición de Tejedores Maestros',
  'Purrfect Threads': 'Purrfect Threads', 'A little yarn. A lot of cats.': 'Un poco de lana. Un montón de gatos.', 'SMALL PAWS. BIG POSSIBILITIES.': 'PATITAS PEQUEÑAS. GRANDES POSIBILIDADES.', 'Pull a thread. Make a friend. Build something cozy.': 'Tira de un hilo. Haz una amistad. Construye algo acogedor.',
  'Workshop': 'Taller', 'Cat collection': 'Colección de gatos', 'New chapter': 'Nuevo capítulo', 'Settings': 'Ajustes', 'YARN IN YOUR STASH': 'LANA EN TU RESERVA', 'yarn / sec': 'lana / seg', 'working cats': 'gatos trabajando', 'Pull yarn': 'Tirar de lana', 'Tap the yarn, or hold to keep pulling': 'Toca la lana o mantén presionado para seguir tirando', 'You can hold Space, too': 'También puedes mantener Espacio',
  'GROW YOUR LITTLE EMPIRE': 'HAZ CRECER TU PEQUEÑO IMPERIO', 'More paws. More possibilities.': 'Más patas. Más posibilidades.', 'A happy crew makes the yarn flow.': 'Un equipo feliz hace que la lana fluya.', 'Your crew': 'Tu equipo', 'Little improvements': 'Pequeñas mejoras', 'Next on your wish list': 'Lo siguiente en tu lista de deseos', 'Purchased': 'Comprado', 'Team complete': 'Equipo completo',
  'THE PURRFECT COMPANY': 'LA COMPAÑÍA PURRFECTA', 'Meet your little legends.': 'Conoce a tus pequeñas leyendas.', 'Grow your crew to meet new friends. They stay with you through every chapter.': 'Haz crecer tu equipo para conocer amistades. Te acompañan en cada capítulo.', 'Choose companion': 'Elige acompañante', 'Your companion': 'Tu acompañante', 'Your first friend is waiting': 'Tu primera amistad te espera',
  'A FRESH BALL OF POSSIBILITIES': 'UN OVILLO NUEVO DE POSIBILIDADES', 'Every ending is a softer beginning.': 'Cada final es un comienzo más suave.', 'Move to a new workshop. Bring your memories, your cats, and a little wisdom.': 'Múdate a un taller nuevo. Lleva tus recuerdos, tus gatos y un poco de sabiduría.', 'Begin a new chapter': 'Comenzar un nuevo capítulo', 'A little wiser, forever': 'Un poco más sabia, para siempre', 'golden paws': 'patas doradas',
  'Ready for a fresh start?': '¿Lista para un nuevo comienzo?', 'Your yarn stash, working teams, buildings, and chapter upgrades reset.': 'Tu reserva de lana, equipos, edificios y mejoras de capítulo se reinician.', 'Keep your collection, talents, golden paws, statistics, and settings. Your cats are moving with you.': 'Conservas tu colección, talentos, patas doradas, estadísticas y ajustes. Tus gatos se mudan contigo.', 'Stay here': 'Quedarme aquí', 'Move to the new workshop': 'Mudarse al nuevo taller', 'Close': 'Cerrar',
  'Make yourself comfortable.': 'Ponte cómodo.', 'Sound volume': 'Volumen de sonido', 'Reduced motion': 'Movimiento reducido', 'Visual quality': 'Calidad visual', 'Balanced': 'Equilibrado', 'Battery saver': 'Ahorro de batería', 'Extra fluffy': 'Extra esponjoso', 'Export save': 'Exportar partida', 'Import save': 'Importar partida', 'Saved on this device. Export a backup before switching browsers.': 'Guardado en este dispositivo. Exporta una copia antes de cambiar de navegador.', 'Saved with love': 'Guardado con cariño', 'Saving…': 'Guardando…', 'Saving unavailable': 'Guardado no disponible', 'Saving is unavailable. Export a backup to keep your progress.': 'No se puede guardar. Exporta una copia para conservar tu progreso.', 'Your last valid backup was recovered. Export a new backup when you can.': 'Se recuperó tu última copia válida. Exporta una nueva cuando puedas.', 'Your save needs a little care.': 'Tu partida necesita un poco de cuidado.', 'Neither saved copy could be read. Nothing has been erased. Download the existing data before restoring a backup or starting over.': 'No se pudo leer ninguna copia guardada. No se borró nada. Descarga los datos existentes antes de restaurar una copia o empezar de nuevo.', 'Download existing data': 'Descargar datos existentes', 'Start a new workshop': 'Empezar un taller nuevo', 'Replace this workshop with the selected save? Your current progress will be exported first.': '¿Reemplazar este taller con la partida elegida? Primero se exportará tu progreso actual.', 'That save could not be imported. Your current workshop has not changed.': 'No se pudo importar esa partida. Tu taller actual no cambió.', 'Your workshop is ready. Welcome back!': 'Tu taller está listo. ¡Te damos la bienvenida de nuevo!', 'Your cats are busy in another tab.': 'Tus gatos están ocupados en otra pestaña.', 'Close the other game tab, then reload this one to keep one safe copy of your progress.': 'Cierra la otra pestaña del juego y recarga esta para conservar una copia segura de tu progreso.', 'The 3D workshop could not load. You can still play with the Pull yarn button. Try enabling browser graphics acceleration.': 'No se pudo cargar el taller 3D. Todavía puedes jugar con el botón Tirar de lana. Prueba activar la aceleración gráfica del navegador.', 'Made for slow afternoons & big little dreams.': 'Hecho para tardes tranquilas y grandes sueños pequeños.',
  'Purrfect': 'Purrfect', 'Threads': 'Threads', 'A little yarn.': 'Un poco de lana.', 'Workshop sections': 'Secciones del taller', 'Your yarn workshop': 'Tu taller de lana', 'Workshop management': 'Gestión del taller', 'Purchase quantity': 'Cantidad de compra', 'Max': 'Máx.', 'THIS CHAPTER': 'ESTE CAPÍTULO', 'Mute sound': 'Silenciar sonido', 'Unmute sound': 'Activar sonido', 'Your cats keep working while you take a break.': 'Tus gatos siguen trabajando mientras descansas.', 'YOUR NEXT CHAPTER BRINGS': 'TU PRÓXIMO CAPÍTULO TRAE', 'A family worth purring about.': 'Una familia digna de ronronear.', '6 / 6 friends': '6 / 6 amistades', 'Your entire collection moves with you into every new chapter.': 'Toda tu colección se muda contigo a cada nuevo capítulo.', 'A fresh start, with familiar friends.': 'Un comienzo nuevo, con amistades conocidas.', 'A newer browser, please.': 'Un navegador más nuevo, por favor.', 'The workshop could not start. Reload to try again. Saved data has not been erased.': 'El taller no pudo iniciar. Recarga para intentarlo otra vez. Los datos guardados no se borraron.', 'This workshop needs the Web Locks API to keep your save safe. Use a recent Chrome, Edge, Firefox, or Safari browser.': 'Este taller necesita la API Web Locks para proteger tu partida. Usa una versión reciente de Chrome, Edge, Firefox o Safari.',
  'Language': 'Idioma', 'Music volume': 'Volumen de música', 'Inspect': 'Inspeccionar', 'Buy upgrade': 'Comprar mejora', 'Back to workshop': 'Volver al taller', 'Critical!': '¡Crítico!', 'Tap a patch to discover its story.': 'Toca un parche para descubrir su historia.', 'Inspect an upgrade, then buy it when ready.': 'Inspecciona una mejora y cómprala cuando quieras.', 'PERMANENT BLESSINGS': 'BENDICIONES PERMANENTES',
  'Kitten': 'Gatito', 'A tiny pair of helping paws.': 'Un pequeño par de patas ayudantes.', 'Basket Buddies': 'Amigos de la canasta', 'Eight roommates. One big yarn habit.': 'Ocho compañeros de casa. Un gran hábito lanero.', 'Knitter Cats': 'Gatos tejedores', 'A cozy corner for a creative crew.': 'Un rincón acogedor para un equipo creativo.', 'Artisan Cats': 'Gatos artesanos', 'Little paws. Serious production.': 'Patitas pequeñas. Producción seria.', 'Cloud Cats': 'Gatos nube', 'A whole new level of fluffy.': 'Un nivel completamente nuevo de esponjosidad.', 'Tailor Tabbies': 'Atigrados sastres', 'Tiny waistcoats. Impeccable seams.': 'Chalecos diminutos. Costuras impecables.', 'Rainbow Dyers': 'Tintoreros arcoíris', 'A splash of color in every pawprint.': 'Un toque de color en cada huella.', 'Spinning Siamese': 'Siameses hilanderos', 'Spinning wheels and even taller tales.': 'Ruecas y cuentos todavía más altos.', 'Dream Weavers': 'Tejedores de sueños', 'Weaving blankets from the softest dreams.': 'Tejiendo mantas con los sueños más suaves.', 'Celestial Cats': 'Gatos celestiales', 'The universe is just one enormous yarn ball.': 'El universo es un enorme ovillo de lana.',
  'Soft Paws': 'Patas suaves', 'Twice the yarn with every touch.': 'El doble de lana con cada toque.', 'Happy Workers': 'Trabajadores felices', '+50% yarn from all your cats.': '+50% de lana de todos tus gatos.', 'Better Tools': 'Mejores herramientas', 'Double all automatic production.': 'Duplica toda la producción automática.', 'Master Tools': 'Herramientas maestras', 'Double Artisan & Cloud Cats output.': 'Duplica la producción de Gatos artesanos y Gatos nube.',
  'Welcome Home': 'Bienvenida a casa', 'Start every new chapter with 3 cats.': 'Comienza cada capítulo nuevo con 3 gatos.', 'Helping Paw': 'Pata ayudante', 'Each touch also earns 1% of your yarn per second.': 'Cada toque también obtiene el 1% de tu lana por segundo.', 'Master Knitters': 'Tejedores maestros', 'Unlock Master Tools to buy in every chapter.': 'Desbloquea Herramientas maestras para comprarlas en cada capítulo.',
  'Head of quality naps': 'Jefa de siestas de calidad', 'Softness specialist': 'Especialista en suavidad', 'Night shift supervisor': 'Supervisora del turno nocturno', 'Chief cuddle officer': 'Directora de mimos', 'Sustainability expert': 'Experta en sostenibilidad', 'Dream department lead': 'Líder del departamento de sueños',
  'Lucky Bell': 'Campana de la suerte', '5% chance for a triple-yarn touch.': '5% de probabilidad de un toque de lana triple.', 'Four-leaf Paw': 'Pata de cuatro hojas', '+5% chance for a triple-yarn touch.': '+5% de probabilidad de un toque de lana triple.', 'Velvet Mittens': 'Mitones de terciopelo', '50% more yarn with every touch.': '50% más de lana con cada toque.', 'Tea Break': 'Pausa para el té', '25% more automatic production.': '25% más de producción automática.', '50% more automatic production.': '50% más de producción automática.', 'Golden Whiskers': 'Bigotes dorados', '+10% chance for a triple-yarn touch.': '+10% de probabilidad de un toque de lana triple.', 'Purring Engine': 'Motor ronroneante', 'Silky Threads': 'Hilos de seda', 'Double the yarn with every touch.': 'Duplica la lana con cada toque.', 'Moonlit Shift': 'Turno a la luz de la luna',
};

const achievementCatalog: Record<string, string> = {
  'A loose thread': 'Un hilo suelto', 'Pull the yarn once.': 'Tira de la lana una vez.', 'Persistent paws': 'Patas persistentes', 'Pull the yarn 75 times.': 'Tira de la lana 75 veces.', 'Paw marathon': 'Maratón de patas', 'Pull the yarn 500 times.': 'Tira de la lana 500 veces.', 'Legend of the thread': 'Leyenda del hilo', 'Pull the yarn 2500 times.': 'Tira de la lana 2500 veces.', 'A proper skein': 'Una madeja de verdad', 'Produce 1000 lifetime yarn.': 'Produce 1000 de lana total.', 'Woolly ambition': 'Ambición lanuda', 'Produce 10000 lifetime yarn.': 'Produce 10000 de lana total.', 'Thread empire': 'Imperio de hilo', 'Produce 100000 lifetime yarn.': 'Produce 100000 de lana total.', 'A million meows': 'Un millón de maullidos', 'Produce one million lifetime yarn.': 'Produce un millón de lana total.', 'The cosmic skein': 'La madeja cósmica', 'Produce one billion lifetime yarn.': 'Produce mil millones de lana total.', 'Employee of the meownth': 'Empleada del miaus', 'Have your first working cat.': 'Ten tu primer gato trabajando.', 'A very small union': 'Un sindicato muy pequeño', 'Have 10 working cats at once.': 'Ten 10 gatos trabajando a la vez.', 'No room on the sofa': 'No hay lugar en el sofá', 'Have 100 working cats at once.': 'Ten 100 gatos trabajando a la vez.', 'Fluffy thousand': 'Mil esponjosos', 'Have 1000 working cats at once.': 'Ten 1000 gatos trabajando a la vez.', 'The city of purrs': 'La ciudad de ronroneos', 'Have 100000 working cats at once.': 'Ten 100000 gatos trabajando a la vez.', 'Mixed company': 'Compañía variada', 'Own three different crew types in one chapter.': 'Ten tres tipos de equipo distintos en un capítulo.', 'Full house': 'Casa llena', 'Own five different crew types in one chapter.': 'Ten cinco tipos de equipo distintos en un capítulo.', 'Ten lives': 'Diez vidas', 'Own all ten crew types in one chapter.': 'Ten los diez tipos de equipo en un capítulo.', 'A bright idea': 'Una idea brillante', 'Buy your first chapter upgrade.': 'Compra tu primera mejora de capítulo.', 'The forbidden toolbox': 'La caja de herramientas prohibida', 'Buy three chapter upgrades across all chapters.': 'Compra tres mejoras de capítulo entre todos los capítulos.', 'Serial tinkerer': 'Inventora serial', 'Buy ten chapter upgrades across all chapters.': 'Compra diez mejoras de capítulo entre todos los capítulos.', 'Professor Purr': 'Profesora Purr', 'Buy 25 chapter upgrades across all chapters.': 'Compra 25 mejoras de capítulo entre todos los capítulos.', 'A fresh start': 'Un nuevo comienzo', 'Begin your first new chapter.': 'Comienza tu primer capítulo nuevo.', 'Third time is a purr': 'La tercera es la vencida', 'Begin three new chapters.': 'Comienza tres capítulos nuevos.', 'Nine lives, new address': 'Nueve vidas, nueva dirección', 'Begin nine new chapters.': 'Comienza nueve capítulos nuevos.', 'Divine favor': 'Favor divino', 'Buy one permanent Olympus talent.': 'Compra un talento permanente del Olimpo.', 'Demigod of fluff': 'Semidiosa de la pelusa', 'Buy two permanent Olympus talents.': 'Compra dos talentos permanentes del Olimpo.', 'The purrfect pantheon': 'El panteón purrfecto', 'Buy all three permanent Olympus talents.': 'Compra los tres talentos permanentes del Olimpo.', 'Hello, friend': 'Hola, amistad', 'Meet your first collectible companion.': 'Conoce a tu primer acompañante coleccionable.', 'The cuddle circle': 'El círculo de mimos', 'Meet three collectible companions.': 'Conoce a tres acompañantes coleccionables.', 'The whole family': 'Toda la familia', 'Meet all six collectible companions.': 'Conoce a los seis acompañantes coleccionables.', 'A new leading cat': 'Un nuevo gato principal', 'Choose a different unlocked companion.': 'Elige un acompañante desbloqueado distinto.', 'While you napped': 'Mientras dormías', 'Collect 1000 yarn through offline production.': 'Recolecta 1000 de lana con producción sin conexión.', 'The dream shift': 'El turno de los sueños', 'Collect 100000 yarn through offline production.': 'Recolecta 100000 de lana con producción sin conexión.', 'One cozy hour': 'Una hora acogedora', 'Spend one active hour in your workshop.': 'Pasa una hora activa en tu taller.', 'Group hug': 'Abrazo grupal', 'Make a successful ×10 purchase.': 'Haz una compra ×10 exitosa.', 'All paws in': 'Todas las patas adentro', 'Make a successful Max purchase.': 'Haz una compra Máx. exitosa.',
  'Pulling': 'Tirando', 'Production': 'Producción', 'Crew': 'Equipo', 'Chapters': 'Capítulos', 'Collection': 'Colección', 'Homecoming': 'Regreso a casa',
};

const catalog = { ...sourceCatalog, ...achievementCatalog };
for (const item of PRODUCER_UPGRADES) {
  const producer = PRODUCERS.find(producer => producer.id === item.producer)!;
  const name = sourceCatalog[producer.name];
  catalog[item.name] = `${name} · Práctica ${item.tier}`;
  catalog[item.detail] = `+1% de producción de ${name} (acumulativo).`;
}
const spanishCopyCache = new WeakMap<Copy, Copy>();

export function setLanguage(next: Language): void { language = next; }
export function getLanguage(): Language { return language; }
export function translate(source: string): string { return language === 'es' ? (catalog[source] ?? source) : source; }

export function getLocalizedText(englishText: Copy): Copy {
  if (language === 'en') return englishText;
  const cached = spanishCopyCache.get(englishText);
  if (cached) return cached;
  const translated = Object.fromEntries(Object.entries(englishText).map(([key, value]) => [
    key,
    Array.isArray(value) ? value.map(item => translate(item)) : typeof value === 'string' ? translate(value) : value,
  ])) as Copy;
  const localized: Copy = {
    ...translated,
    achievementsCount: (n, total) => `${n} / ${total} obtenidos`, achievementsUnlocked: count => `¡${count} logros desbloqueados! Mira tu álbum.`, achievementUnlocked: name => `Logro desbloqueado: ${name}`,
    adopt: name => `Adoptar a ${name}`, owned: count => `${count} en propiedad`, catsAdded: count => `+${count} gatos`, productionAdded: count => `+${count} lana / seg`, cost: count => `${count} lana`, unlockCats: count => `Conoce a ${count.toLocaleString('es-AR')} gatos trabajando`, chapterLabel: count => `CAPÍTULO ${String(count + 1).padStart(2, '0')} · EL TALLER ACOGEDOR`, reward: count => `+${count} pata${count === '1' ? '' : 's'} dorada${count === '1' ? '' : 's'}`, remaining: count => `Produce ${count} más de lana en este capítulo para desbloquear el reinicio.`, offline: count => `Tus gatos hicieron ${count} de lana mientras no estabas.`, milestone: name => `¡${name} se sumó a tu colección!`, crewJoined: count => `${count} patas nuevas en el equipo.`, progressGoal: count => `${count} / 75 de lana`, firstGoal: 'Tu primer pequeño ayudante', firstGoalDetail: '75 de lana traen a casa a tu primer gatito.', nextGoal: name => `Haz lugar para ${name}`, percent: value => `${value}% del camino`, perTap: count => `+${count} por toque`, spendPoints: count => `${count} pata${String(count) === '1' ? '' : 's'} dorada${String(count) === '1' ? '' : 's'}`, talentBought: 'Un truco nuevo, para siempre.', upgradeBought: 'Una pequeña mejora. Mucha posibilidad.', buy: name => `Comprar ${name}`, criticalOdds: (chance = 0) => `Probabilidad actual: ${chance}% de lana ×3. Las bonificaciones se suman.`,
  };
  spanishCopyCache.set(englishText, localized);
  return localized;
}
