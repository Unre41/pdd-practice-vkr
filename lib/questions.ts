export type QuestionMode = 'signs' | 'signals' | 'priority';

// Update this identifier whenever the wording, answer key, or composition of the bank changes.
export const QUESTION_BANK_VERSION = '2026-09-30-v2';

export type RoadVisual =
  | 'speed-40'
  | 'no-entry'
  | 'stop'
  | 'main-road'
  | 'yellow-light'
  | 'flashing-green'
  | 'red-yellow'
  | 'lights-off'
  | 'indicator'
  | 'reverse'
  | 'tram'
  | 'pedestrian-crossing'
  | 'emergency'
  | 'signal-over-sign'
  | 'right-turn'
  | 'parking-exit'
  | 'right-hand-rule'
  | 'left-turn'
  | 'roundabout'
  | 'bus-stop';

export type Question = {
  id: string;
  mode: QuestionMode;
  title: string;
  prompt: string;
  answers: string[];
  correctAnswer: number;
  explanation: string;
  rule: string;
  sourceUrl: string;
  visual: RoadVisual;
};

export const modeLabels: Record<QuestionMode, string> = {
  signs: 'Дорожные знаки',
  signals: 'Сигналы и манёвры',
  priority: 'Очередность движения',
};

const signsSource = 'https://www.consultant.ru/document/cons_doc_LAW_2709/bf1f4781b8aa1172e9993c89c36db0dcdc88c495/';
const prioritySignsSource = 'https://www.consultant.ru/document/cons_doc_LAW_2709/f813c443e749db7b760a9fb7729a4e4ccdb2f3ea/';
const signalsSource = 'https://www.consultant.ru/document/cons_doc_LAW_2709/4b7a10a56ed37080fc96999db5f3db6f3aa58cc6/';
const maneuversSource = 'https://www.consultant.ru/document/cons_doc_LAW_2709/2fdfa8559de67744dab415a31c1f987bc016016b/';
const intersectionsSource = 'https://www.consultant.ru/document/cons_doc_LAW_2709/74cbe820904f4f8ce76047ddbd81d14c8b953d3e/';
const publicTransportSource = 'https://www.consultant.ru/document/cons_doc_LAW_2709/1d225b4fe43aaefac2b8f54fc0579d997cc402bc/';
const rulesSource = 'https://www.consultant.ru/document/cons_doc_LAW_2709/';

export const questions: Question[] = [
  {
    id: 'sign-speed-40',
    mode: 'signs',
    title: 'Ограничение скорости',
    prompt: 'Что означает этот знак?',
    answers: ['Максимальная скорость — 40 км/ч', 'Минимальная скорость — 40 км/ч', 'Рекомендуемая скорость — 40 км/ч'],
    correctAnswer: 0,
    explanation: 'Двигаться быстрее 40 км/ч на участке действия знака запрещено.',
    rule: 'ПДД РФ, знак 3.24',
    sourceUrl: signsSource,
    visual: 'speed-40',
  },
  {
    id: 'sign-no-entry',
    mode: 'signs',
    title: 'Запрещающий знак',
    prompt: 'Какое требование устанавливает этот знак?',
    answers: ['Запрещает только остановку', 'Запрещает въезд в данном направлении', 'Обозначает конец односторонней дороги'],
    correctAnswer: 1,
    explanation: 'Знак 3.1 запрещает въезд транспортных средств в данном направлении с учётом предусмотренных исключений.',
    rule: 'ПДД РФ, знак 3.1',
    sourceUrl: signsSource,
    visual: 'no-entry',
  },
  {
    id: 'sign-stop',
    mode: 'signs',
    title: 'Обязательная остановка',
    prompt: 'Знак 2.5 установлен перед обычным перекрёстком, стоп-линии нет. Где остановиться?',
    answers: ['Через пять метров после знака', 'Перед краем пересекаемой проезжей части', 'Непосредственно перед знаком независимо от его положения'],
    correctAnswer: 1,
    explanation: 'Перед обычным перекрёстком без стоп-линии останавливаются перед краем пересекаемой проезжей части. Остановка перед знаком без стоп-линии предусмотрена для железнодорожного переезда или карантинного поста.',
    rule: 'ПДД РФ, знак 2.5',
    sourceUrl: prioritySignsSource,
    visual: 'stop',
  },
  {
    id: 'sign-main-road',
    mode: 'signs',
    title: 'Главная дорога',
    prompt: 'Какое преимущество предоставляет этот знак?',
    answers: ['Преимущество на нерегулируемых перекрёстках', 'Право ехать с любой скоростью', 'Преимущество только перед пешеходами'],
    correctAnswer: 0,
    explanation: 'Знак обозначает дорогу, имеющую преимущество при проезде нерегулируемых перекрёстков.',
    rule: 'ПДД РФ, знак 2.1',
    sourceUrl: prioritySignsSource,
    visual: 'main-road',
  },
  {
    id: 'signal-yellow',
    mode: 'signals',
    title: 'Жёлтый сигнал',
    prompt: 'Загорелся жёлтый сигнал, и вы можете остановиться без экстренного торможения. Что делать?',
    answers: ['Продолжить движение без снижения скорости', 'Остановиться в установленном месте', 'Ускориться, чтобы проехать перекрёсток'],
    correctAnswer: 1,
    explanation: 'Исключение допускается лишь тогда, когда остановиться без экстренного торможения уже невозможно.',
    rule: 'ПДД РФ, пункты 6.2, 6.13 и 6.14',
    sourceUrl: signalsSource,
    visual: 'yellow-light',
  },
  {
    id: 'signal-priority-conflict',
    mode: 'signals',
    title: 'Светофор и знаки',
    prompt: 'Сигнал светофора противоречит знаку приоритета. Чем руководствоваться?',
    answers: ['Знаком приоритета', 'Только дорожной разметкой', 'Сигналом светофора'],
    correctAnswer: 2,
    explanation: 'На регулируемом перекрёстке сигналы светофора имеют приоритет над знаками приоритета.',
    rule: 'ПДД РФ, пункт 6.15',
    sourceUrl: signalsSource,
    visual: 'signal-over-sign',
  },
  {
    id: 'maneuver-right-turn',
    mode: 'signals',
    title: 'Поворот направо',
    prompt: 'Вы поворачиваете направо. Пешеход и велосипедист пересекают проезжую часть дороги, на которую вы поворачиваете. Кому уступить?',
    answers: ['Обоим участникам движения', 'Только пешеходу', 'Никому при зелёном сигнале'],
    correctAnswer: 0,
    explanation: 'При повороте водитель уступает пешеходам, пользователям СИМ и велосипедистам, пересекающим дорогу, на которую он поворачивает.',
    rule: 'ПДД РФ, пункт 13.1',
    sourceUrl: intersectionsSource,
    visual: 'right-turn',
  },
  {
    id: 'maneuver-parking-exit',
    mode: 'signals',
    title: 'Выезд с парковки',
    prompt: 'Вы выезжаете на дорогу с парковки. Кто имеет преимущество?',
    answers: ['Автомобиль, выезжающий с парковки', 'Участники, уже движущиеся по дороге', 'Тот, кто первым включил указатель поворота'],
    correctAnswer: 1,
    explanation: 'При выезде с прилегающей территории нужно уступить транспортным средствам, пользователям СИМ и пешеходам на дороге.',
    rule: 'ПДД РФ, пункт 8.3',
    sourceUrl: maneuversSource,
    visual: 'parking-exit',
  },
  {
    id: 'priority-right-hand',
    mode: 'priority',
    title: 'Помеха справа',
    prompt: 'Вы на легковом автомобиле приближаетесь к нерегулируемому равнозначному перекрёстку. Справа приближается автомобиль. Ваши действия?',
    answers: ['Проехать первым', 'Остановиться и ждать сигнала регулировщика', 'Уступить автомобилю справа'],
    correctAnswer: 2,
    explanation: 'Водитель безрельсового транспортного средства уступает транспортным средствам, приближающимся справа.',
    rule: 'ПДД РФ, пункт 13.11',
    sourceUrl: intersectionsSource,
    visual: 'right-hand-rule',
  },
  {
    id: 'priority-left-turn',
    mode: 'priority',
    title: 'Поворот налево',
    prompt: 'На нерегулируемом равнозначном перекрёстке вы поворачиваете налево на легковом автомобиле, встречный автомобиль едет прямо. Кто проедет первым?',
    answers: ['Встречный автомобиль', 'Ваш автомобиль', 'Оба автомобиля одновременно'],
    correctAnswer: 0,
    explanation: 'При повороте налево необходимо уступить встречному транспортному средству, которое движется прямо или направо.',
    rule: 'ПДД РФ, пункт 13.12',
    sourceUrl: intersectionsSource,
    visual: 'left-turn',
  },
  {
    id: 'priority-roundabout',
    mode: 'priority',
    title: 'Круговое движение',
    prompt: 'Вы въезжаете по второстепенной дороге на обозначенный круговой перекрёсток. Кому уступить?',
    answers: ['Никому — въезжающий всегда имеет преимущество', 'Транспортным средствам на круге', 'Только автобусам и троллейбусам'],
    correctAnswer: 1,
    explanation: 'Въезжающий по дороге, не являющейся главной, уступает транспортным средствам, уже движущимся по круговому перекрёстку.',
    rule: 'ПДД РФ, пункт 13.11(1)',
    sourceUrl: intersectionsSource,
    visual: 'roundabout',
  },
  {
    id: 'priority-bus-stop',
    mode: 'priority',
    title: 'Автобус от остановки',
    prompt: 'В населённом пункте автобус начинает движение от обозначенной остановки. Что должен сделать водитель рядом?',
    answers: ['Обязательно обогнать автобус', 'Подать звуковой сигнал и продолжить движение', 'Уступить дорогу автобусу'],
    correctAnswer: 2,
    explanation: 'В населённых пунктах водители уступают автобусам и троллейбусам, начинающим движение от обозначенной остановки.',
    rule: 'ПДД РФ, пункт 18.3',
    sourceUrl: publicTransportSource,
    visual: 'bus-stop',
  },
  {
    id: 'sign-speed-lower',
    mode: 'signs',
    title: 'Скорость ниже ограничения',
    prompt: 'Знак устанавливает максимум 40 км/ч. Можно ли двигаться со скоростью 30 км/ч?',
    answers: ['Да, если это не создаёт необоснованных помех', 'Нет, необходимо ехать ровно 40 км/ч', 'Только в тёмное время суток'],
    correctAnswer: 0,
    explanation: 'Знак 3.24 задаёт максимальную, а не обязательную скорость. Водитель выбирает безопасную скорость с учётом условий движения.',
    rule: 'ПДД РФ, пункты 10.1 и знак 3.24',
    sourceUrl: signsSource,
    visual: 'speed-40',
  },
  {
    id: 'sign-no-entry-pedestrian',
    mode: 'signs',
    title: 'Действие запрещающего знака',
    prompt: 'Запрещает ли знак 3.1 движение пешеходов?',
    answers: ['Да, всегда', 'Нет, знак регулирует въезд транспортных средств', 'Только если нет тротуара'],
    correctAnswer: 1,
    explanation: 'Знак «Въезд запрещён» запрещает въезд транспортных средств в данном направлении и сам по себе не является запретом движения пешеходов.',
    rule: 'ПДД РФ, знак 3.1',
    sourceUrl: signsSource,
    visual: 'no-entry',
  },
  {
    id: 'sign-stop-line',
    mode: 'signs',
    title: 'Знак STOP и стоп-линия',
    prompt: 'Где остановиться, если перед знаком 2.5 нанесена стоп-линия?',
    answers: ['Перед стоп-линией', 'Непосредственно под знаком', 'После пересечения проезжих частей'],
    correctAnswer: 0,
    explanation: 'При наличии стоп-линии останавливаются перед ней. На обычном перекрёстке без стоп-линии остановка выполняется перед краем пересекаемой проезжей части.',
    rule: 'ПДД РФ, знак 2.5 и разметка 1.12',
    sourceUrl: prioritySignsSource,
    visual: 'stop',
  },
  {
    id: 'sign-main-road-scope',
    mode: 'signs',
    title: 'Назначение главной дороги',
    prompt: 'В какой ситуации знак 2.1 непосредственно определяет очерёдность проезда?',
    answers: ['На нерегулируемом перекрёстке', 'При любом работающем светофоре', 'Только на пешеходном переходе'],
    correctAnswer: 0,
    explanation: 'Знак «Главная дорога» предоставляет преимущество при проезде нерегулируемых перекрёстков.',
    rule: 'ПДД РФ, знак 2.1',
    sourceUrl: prioritySignsSource,
    visual: 'main-road',
  },
  {
    id: 'signal-flashing-green',
    mode: 'signals',
    title: 'Мигающий зелёный',
    prompt: 'Что означает мигающий зелёный сигнал светофора?',
    answers: ['Движение запрещено', 'Движение разрешено, но время сигнала истекает', 'Перекрёсток стал нерегулируемым'],
    correctAnswer: 1,
    explanation: 'Мигающий зелёный разрешает движение и информирует, что время его действия заканчивается и скоро включится запрещающий сигнал.',
    rule: 'ПДД РФ, пункт 6.2',
    sourceUrl: signalsSource,
    visual: 'flashing-green',
  },
  {
    id: 'signal-red-yellow',
    mode: 'signals',
    title: 'Красный с жёлтым',
    prompt: 'Одновременно включены красный и жёлтый сигналы. Можно ли начинать движение?',
    answers: ['Да, если перекрёсток свободен', 'Нет, сочетание запрещает движение и предупреждает о зелёном', 'Да, только направо'],
    correctAnswer: 1,
    explanation: 'Сочетание красного и жёлтого сигналов запрещает движение и сообщает о предстоящем включении зелёного.',
    rule: 'ПДД РФ, пункт 6.2',
    sourceUrl: signalsSource,
    visual: 'red-yellow',
  },
  {
    id: 'maneuver-indicator-priority',
    mode: 'signals',
    title: 'Указатель поворота',
    prompt: 'Даёт ли включённый указатель поворота преимущество перед другими участниками?',
    answers: ['Да, если включён заранее', 'Нет, сигнал не даёт преимущества', 'Только при перестроении вправо'],
    correctAnswer: 1,
    explanation: 'Подача сигнала не даёт водителю преимущества и не освобождает от мер предосторожности.',
    rule: 'ПДД РФ, пункт 8.2',
    sourceUrl: maneuversSource,
    visual: 'indicator',
  },
  {
    id: 'maneuver-reverse-safety',
    mode: 'signals',
    title: 'Движение задним ходом',
    prompt: 'При каком условии разрешается движение задним ходом?',
    answers: ['Если манёвр безопасен и не создаёт помех', 'Если включена аварийная сигнализация', 'На любом перекрёстке при малой скорости'],
    correctAnswer: 0,
    explanation: 'Движение задним ходом разрешается при безопасности манёвра и отсутствии помех другим участникам; в ряде мест оно запрещено.',
    rule: 'ПДД РФ, пункт 8.12',
    sourceUrl: maneuversSource,
    visual: 'reverse',
  },
  {
    id: 'priority-traffic-light-off',
    mode: 'priority',
    title: 'Неработающий светофор',
    prompt: 'Светофор не работает, регулировщика нет. Чем руководствоваться на перекрёстке?',
    answers: ['Только правилом помехи справа', 'Знаками приоритета и правилами нерегулируемых перекрёстков', 'Сигналами поворота других автомобилей'],
    correctAnswer: 1,
    explanation: 'При неработающем светофоре перекрёсток считается нерегулируемым; водитель учитывает знаки приоритета и соответствующие правила проезда.',
    rule: 'ПДД РФ, пункт 13.3',
    sourceUrl: intersectionsSource,
    visual: 'lights-off',
  },
  {
    id: 'priority-tram-equal',
    mode: 'priority',
    title: 'Трамвай на равнозначном перекрёстке',
    prompt: 'Кто имеет преимущество на равнозначном нерегулируемом перекрёстке: трамвай или легковой автомобиль?',
    answers: ['Легковой автомобиль', 'Трамвай независимо от направления движения', 'Тот, кто находится справа'],
    correctAnswer: 1,
    explanation: 'На равнозначном перекрёстке трамвай имеет преимущество перед безрельсовыми транспортными средствами независимо от направления движения.',
    rule: 'ПДД РФ, пункт 13.11',
    sourceUrl: intersectionsSource,
    visual: 'tram',
  },
  {
    id: 'priority-pedestrian-crossing',
    mode: 'priority',
    title: 'Нерегулируемый переход',
    prompt: 'Пешеход вступил на нерегулируемый пешеходный переход. Что должен сделать водитель?',
    answers: ['Уступить дорогу пешеходу', 'Продолжить движение, если подан звуковой сигнал', 'Уступить только группе пешеходов'],
    correctAnswer: 0,
    explanation: 'Водитель, приближающийся к нерегулируемому переходу, обязан уступить дорогу пешеходам, переходящим дорогу или вступившим на проезжую часть для перехода.',
    rule: 'ПДД РФ, пункт 14.1',
    sourceUrl: rulesSource,
    visual: 'pedestrian-crossing',
  },
  {
    id: 'priority-emergency-vehicle',
    mode: 'priority',
    title: 'Специальный автомобиль',
    prompt: 'Приближается автомобиль с включёнными синим маячком и специальным звуковым сигналом. Ваши действия?',
    answers: ['Уступить дорогу для беспрепятственного проезда', 'Продолжить движение с прежней скоростью', 'Остановиться только при красном сигнале'],
    correctAnswer: 0,
    explanation: 'При приближении такого транспортного средства водители обязаны уступить дорогу для обеспечения его беспрепятственного проезда.',
    rule: 'ПДД РФ, пункт 3.2',
    sourceUrl: rulesSource,
    visual: 'emergency',
  },
];
