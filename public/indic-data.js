// Original beginner course data. Roman spellings are practical reading aids,
// not phonetic transcriptions; forms favor polite, widely understood usage.
// Sources checked: MSU Basic Tamil (greetings, numbers, family, daily activities)
// and Karnataka DTE Balake Kannada (introductory conversations and transliteration).
// https://openbooks.lib.msu.edu/basictamil/
// https://dtek.karnataka.gov.in/storage/pdf-files/C-20%20syllabus/Balake%20Kannada-2.pdf

const v = (text, roman, meaning, icon) => ({ text, roman, meaning, icon });
const d = (text, roman, meaning) => ({ text, roman, meaning });
const lesson = (id, title, stage, icon, words, dialogue) => ({ id, title, stage, icon, words, dialogue });

export const courses = {
  ta: {
    name: 'Tamil', native: 'தமிழ்', locale: 'ta-IN',
    lessons: [
      lesson('ta-hello', 'Hello and goodbye', 1, '👋', [
        v('வணக்கம்', 'vaṇakkam', 'Hello / greetings', '👋'), v('காலை வணக்கம்', 'kālai vaṇakkam', 'Good morning', '🌅'), v('போய் வருகிறேன்', 'pōy varukiṟēṉ', 'Goodbye (I’m leaving)', '🚪'), v('நன்றி', 'naṉṟi', 'Thank you', '🙏')
      ], [d('வணக்கம்!', 'Vaṇakkam!', 'Hello!'), d('நீங்கள் எப்படி இருக்கிறீர்கள்?', 'Nīṅkaḷ eppaṭi irukkiṟīrkaḷ?', 'How are you?'), d('நான் நன்றாக இருக்கிறேன். நன்றி.', 'Nāṉ naṉṟāka irukkiṟēṉ. Naṉṟi.', 'I am well. Thank you.')]),
      lesson('ta-about-me', 'My name and age', 1, '🙂', [
        v('என் பெயர்', 'eṉ peyar', 'My name', '🏷️'), v('உங்கள் பெயர் என்ன?', 'uṅkaḷ peyar eṉṉa?', 'What is your name?', '❓'), v('நான்', 'nāṉ', 'I / me', '🙋'), v('வயது', 'vayatu', 'Age', '🎂'), v('மகிழ்ச்சி', 'makiḻcci', 'Nice / happy', '😊')
      ], [d('உங்கள் பெயர் என்ன?', 'Uṅkaḷ peyar eṉṉa?', 'What is your name?'), d('என் பெயர் மீனா.', 'Eṉ peyar Mīṉā.', 'My name is Meena.'), d('உங்களைச் சந்தித்ததில் மகிழ்ச்சி.', 'Uṅkaḷaic cantittatil makiḻcci.', 'Nice to meet you.')]),
      lesson('ta-family', 'My family', 1, '👨‍👩‍👧', [
        v('குடும்பம்', 'kuṭumpam', 'Family', '👨‍👩‍👧'), v('அம்மா', 'ammā', 'Mother', '👩'), v('அப்பா', 'appā', 'Father', '👨'), v('அண்ணன்', 'aṇṇaṉ', 'Older brother', '🧑'), v('தங்கை', 'taṅkai', 'Younger sister', '👧')
      ], [d('இது என் குடும்பம்.', 'Itu eṉ kuṭumpam.', 'This is my family.'), d('இவர் என் அம்மா.', 'Ivar eṉ ammā.', 'This is my mother.'), d('உங்களுக்கு ஒரு தங்கை இருக்கிறாளா?', 'Uṅkaḷukku oru taṅkai irukkiṟāḷā?', 'Do you have a younger sister?')]),
      lesson('ta-numbers', 'Numbers one to ten', 1, '🔢', [
        v('ஒன்று', 'oṉṟu', 'One', '1️⃣'), v('இரண்டு', 'iraṇṭu', 'Two', '2️⃣'), v('மூன்று', 'mūṉṟu', 'Three', '3️⃣'), v('நான்கு', 'nāṉku', 'Four', '4️⃣'), v('ஐந்து', 'aintu', 'Five', '5️⃣'), v('ஆறு', 'āṟu', 'Six', '6️⃣'), v('ஏழு', 'ēḻu', 'Seven', '7️⃣'), v('எட்டு', 'eṭṭu', 'Eight', '8️⃣'), v('ஒன்பது', 'oṉpatu', 'Nine', '9️⃣'), v('பத்து', 'pattu', 'Ten', '🔟')
      ], [d('உங்களிடம் எத்தனை புத்தகங்கள் உள்ளன?', 'Uṅkaḷiṭam ettaṉai puttakaṅkaḷ uḷḷaṉa?', 'How many books do you have?'), d('என்னிடம் இரண்டு புத்தகங்கள் உள்ளன.', 'Eṉṉiṭam iraṇṭu puttakaṅkaḷ uḷḷaṉa.', 'I have two books.'), d('ஒன்று, இரண்டு, மூன்று!', 'Oṉṟu, iraṇṭu, mūṉṟu!', 'One, two, three!')]),
      lesson('ta-colors', 'Colors around me', 1, '🎨', [
        v('சிவப்பு', 'civappu', 'Red', '🟥'), v('நீலம்', 'nīlam', 'Blue', '🟦'), v('பச்சை', 'paccai', 'Green', '🟩'), v('மஞ்சள்', 'mañcaḷ', 'Yellow', '🟨'), v('வெள்ளை', 'veḷḷai', 'White', '⬜')
      ], [d('இது என்ன நிறம்?', 'Itu eṉṉa niṟam?', 'What color is this?'), d('இது சிவப்பு.', 'Itu civappu.', 'This is red.'), d('எனக்கு நீல நிறம் பிடிக்கும்.', 'Eṉakku nīla niṟam piṭikkum.', 'I like the color blue.')]),
      lesson('ta-animals', 'Animals', 2, '🐾', [
        v('நாய்', 'nāy', 'Dog', '🐕'), v('பூனை', 'pūṉai', 'Cat', '🐈'), v('பசு', 'pacu', 'Cow', '🐄'), v('யானை', 'yāṉai', 'Elephant', '🐘'), v('பறவை', 'paṟavai', 'Bird', '🐦')
      ], [d('உனக்கு எந்த விலங்கு பிடிக்கும்?', 'Uṉakku enta vilaṅku piṭikkum?', 'Which animal do you like?'), d('எனக்கு யானை பிடிக்கும்.', 'Eṉakku yāṉai piṭikkum.', 'I like elephants.'), d('அந்தப் பறவை அழகாக இருக்கிறது.', 'Antap paṟavai aḻakāka irukkiṟatu.', 'That bird is beautiful.')]),
      lesson('ta-food', 'Food and likes', 2, '🍚', [
        v('சாதம்', 'cātam', 'Cooked rice', '🍚'), v('இட்லி', 'iṭli', 'Idli', '🥮'), v('தண்ணீர்', 'taṇṇīr', 'Water', '💧'), v('பழம்', 'paḻam', 'Fruit', '🍎'), v('பசிக்கிறது', 'pacikkiṟatu', 'I am hungry', '😋')
      ], [d('உங்களுக்கு என்ன வேண்டும்?', 'Uṅkaḷukku eṉṉa vēṇṭum?', 'What would you like?'), d('எனக்கு இட்லியும் தண்ணீரும் வேண்டும்.', 'Eṉakku iṭliyum taṇṇīrum vēṇṭum.', 'I would like idli and water.'), d('எனக்கு மாம்பழம் பிடிக்கும்.', 'Eṉakku māmpaḻam piṭikkum.', 'I like mango.')]),
      lesson('ta-school', 'At school', 2, '🏫', [
        v('பள்ளி', 'paḷḷi', 'School', '🏫'), v('ஆசிரியர்', 'āciriyar', 'Teacher', '🧑‍🏫'), v('மாணவர்', 'māṇavar', 'Student', '🧑‍🎓'), v('புத்தகம்', 'puttakam', 'Book', '📘'), v('பேனா', 'pēṉā', 'Pen', '🖊️')
      ], [d('உங்கள் பள்ளி எங்கே?', 'Uṅkaḷ paḷḷi eṅkē?', 'Where is your school?'), d('என் பள்ளி அருகில் இருக்கிறது.', 'Eṉ paḷḷi arukil irukkiṟatu.', 'My school is nearby.'), d('ஆசிரியர் புத்தகத்தைத் திறக்கச் சொல்கிறார்.', 'Āciriyar puttakattait tiṟakkac colkiṟār.', 'The teacher asks us to open the book.')]),
      lesson('ta-polite', 'Polite requests', 2, '🙏', [
        v('தயவுசெய்து', 'tayavuceytu', 'Please', '🙏'), v('கொஞ்சம்', 'koñcam', 'A little', '🤏'), v('மெதுவாக', 'metuvāka', 'Slowly', '🐢'), v('மீண்டும்', 'mīṇṭum', 'Again', '🔁'), v('மன்னிக்கவும்', 'maṉṉikkavum', 'Excuse me / sorry', '🙇')
      ], [d('தயவுசெய்து மெதுவாகப் பேசுங்கள்.', 'Tayavuceytu metuvākap pēcuṅkaḷ.', 'Please speak slowly.'), d('இதை மீண்டும் சொல்ல முடியுமா?', 'Itai mīṇṭum colla muṭiyumā?', 'Could you say that again?'), d('மன்னிக்கவும், எனக்குப் புரியவில்லை.', 'Maṉṉikkavum, eṉakku puriyavillai.', 'Sorry, I did not understand.')]),
      lesson('ta-directions', 'Finding the way', 3, '🧭', [
        v('எங்கே?', 'eṅkē?', 'Where?', '❓'), v('வலது', 'valatu', 'Right', '➡️'), v('இடது', 'iṭatu', 'Left', '⬅️'), v('நேராக', 'nērāka', 'Straight ahead', '⬆️'), v('அருகில்', 'arukil', 'Nearby', '📍')
      ], [d('பேருந்து நிலையம் எங்கே?', 'Pēruntu nilaiyam eṅkē?', 'Where is the bus stop?'), d('நேராகச் சென்று இடதுபுறம் திரும்புங்கள்.', 'Nērāka cenṟu iṭatupuṟam tirumpuṅkaḷ.', 'Go straight and turn left.'), d('நன்றி! அது அருகிலா?', 'Naṉṟi! Atu arukilā?', 'Thank you! Is it nearby?')]),
      lesson('ta-routine', 'My daily routine', 3, '⏰', [
        v('காலை', 'kālai', 'Morning', '🌅'), v('எழுந்திரு', 'eḻuntiru', 'Wake up', '⏰'), v('சாப்பிடு', 'cāppiṭu', 'Eat', '🍽️'), v('படி', 'paṭi', 'Study / read', '📖'), v('இரவு', 'iravu', 'Night', '🌙')
      ], [d('நான் காலையில் எழுந்திருப்பேன்.', 'Nāṉ kālaiyil eḻuntiruppēṉ.', 'I wake up in the morning.'), d('பள்ளிக்குப் பிறகு படிப்பேன்.', 'Paḷḷikkup piṟaku paṭippēṉ.', 'I study after school.'), d('நீங்கள் இரவில் என்ன செய்வீர்கள்?', 'Nīṅkaḷ iravil eṉṉa ceyvīrkaḷ?', 'What do you do at night?')]),
      lesson('ta-chat', 'A simple conversation', 3, '💬', [
        v('இன்று', 'iṉṟu', 'Today', '📅'), v('நல்ல', 'nalla', 'Good / nice', '✨'), v('பிடிக்கும்', 'piṭikkum', 'Like', '❤️'), v('விளையாடு', 'viḷaiyāṭu', 'Play', '⚽'), v('சந்திப்போம்', 'cantippōm', 'See you / let’s meet', '👋')
      ], [d('இன்று பள்ளி எப்படி இருந்தது?', 'Iṉṟu paḷḷi eppaṭi iruntatu?', 'How was school today?'), d('நன்றாக இருந்தது. நண்பர்களுடன் விளையாடினேன்.', 'Naṉṟāka iruntatu. Naṇparkaḷuṭaṉ viḷaiyāṭiṉēṉ.', 'It was good. I played with friends.'), d('நாளை மீண்டும் சந்திப்போம்!', 'Nāḷai mīṇṭum cantippōm!', 'See you again tomorrow!')])
    ]
  },
  kn: {
    name: 'Kannada', native: 'ಕನ್ನಡ', locale: 'kn-IN',
    lessons: [
      lesson('kn-hello', 'Hello and goodbye', 1, '👋', [
        v('ನಮಸ್ಕಾರ', 'namaskāra', 'Hello / greetings', '👋'), v('ಶುಭೋದಯ', 'śubhōdaya', 'Good morning', '🌅'), v('ಧನ್ಯವಾದಗಳು', 'dhanyavādagaḷu', 'Thank you', '🙏'), v('ಮತ್ತೆ ಸಿಗೋಣ', 'matte sigōṇa', 'See you again', '🚪')
      ], [d('ನಮಸ್ಕಾರ!', 'Namaskāra!', 'Hello!'), d('ನೀವು ಹೇಗಿದ್ದೀರಿ?', 'Nīvu hēgiddīri?', 'How are you?'), d('ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ. ಧನ್ಯವಾದಗಳು.', 'Nānu cennāgiddēne. Dhanyavādagaḷu.', 'I am fine. Thank you.')]),
      lesson('kn-about-me', 'My name and age', 1, '🙂', [
        v('ನನ್ನ ಹೆಸರು', 'nanna hesaru', 'My name', '🏷️'), v('ನಿಮ್ಮ ಹೆಸರೇನು?', 'nimma hesarēnu?', 'What is your name?', '❓'), v('ನಾನು', 'nānu', 'I / me', '🙋'), v('ವಯಸ್ಸು', 'vayassu', 'Age', '🎂'), v('ಸಂತೋಷ', 'santōṣa', 'Happy / pleased', '😊')
      ], [d('ನಿಮ್ಮ ಹೆಸರೇನು?', 'Nimma hesarēnu?', 'What is your name?'), d('ನನ್ನ ಹೆಸರು ಮೀನಾಕ್ಷಿ.', 'Nanna hesaru Mīnāksi.', 'My name is Meenakshi.'), d('ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗಿ ಸಂತೋಷವಾಯಿತು.', 'Nimmannu bhēṭiyāgi santōṣavāyitu.', 'Nice to meet you.')]),
      lesson('kn-family', 'My family', 1, '👨‍👩‍👧', [
        v('ಕುಟುಂಬ', 'kuṭumba', 'Family', '👨‍👩‍👧'), v('ಅಮ್ಮ', 'amma', 'Mother', '👩'), v('ಅಪ್ಪ', 'appa', 'Father', '👨'), v('ಅಣ್ಣ', 'aṇṇa', 'Older brother', '🧑'), v('ತಂಗಿ', 'taṅgi', 'Younger sister', '👧')
      ], [d('ಇದು ನನ್ನ ಕುಟುಂಬ.', 'Idu nanna kuṭumba.', 'This is my family.'), d('ಇವರು ನನ್ನ ಅಮ್ಮ.', 'Ivaru nanna amma.', 'This is my mother.'), d('ನಿಮಗೆ ತಂಗಿ ಇದ್ದಾಳೆಯೇ?', 'Nimage taṅgi iddāḷeyē?', 'Do you have a younger sister?')]),
      lesson('kn-numbers', 'Numbers one to ten', 1, '🔢', [
        v('ಒಂದು', 'ondu', 'One', '1️⃣'), v('ಎರಡು', 'eraḍu', 'Two', '2️⃣'), v('ಮೂರು', 'mūru', 'Three', '3️⃣'), v('ನಾಲ್ಕು', 'nālku', 'Four', '4️⃣'), v('ಐದು', 'aidu', 'Five', '5️⃣'), v('ಆರು', 'āru', 'Six', '6️⃣'), v('ಏಳು', 'ēḷu', 'Seven', '7️⃣'), v('ಎಂಟು', 'eṇṭu', 'Eight', '8️⃣'), v('ಒಂಬತ್ತು', 'ombattu', 'Nine', '9️⃣'), v('ಹತ್ತು', 'hattu', 'Ten', '🔟')
      ], [d('ನಿಮ್ಮ ಬಳಿ ಎಷ್ಟು ಪುಸ್ತಕಗಳಿವೆ?', 'Nimma baḷi eṣṭu pustakagaḷive?', 'How many books do you have?'), d('ನನ್ನ ಬಳಿ ಎರಡು ಪುಸ್ತಕಗಳಿವೆ.', 'Nanna baḷi eraḍu pustakagaḷive.', 'I have two books.'), d('ಒಂದು, ಎರಡು, ಮೂರು!', 'Ondu, eraḍu, mūru!', 'One, two, three!')]),
      lesson('kn-colors', 'Colors around me', 1, '🎨', [
        v('ಕೆಂಪು', 'kempu', 'Red', '🟥'), v('ನೀಲಿ', 'nīli', 'Blue', '🟦'), v('ಹಸಿರು', 'hasiru', 'Green', '🟩'), v('ಹಳದಿ', 'haḷadi', 'Yellow', '🟨'), v('ಬಿಳಿ', 'biḷi', 'White', '⬜')
      ], [d('ಇದು ಯಾವ ಬಣ್ಣ?', 'Idu yāva baṇṇa?', 'What color is this?'), d('ಇದು ಕೆಂಪು.', 'Idu kempu.', 'This is red.'), d('ನನಗೆ ನೀಲಿ ಬಣ್ಣ ಇಷ್ಟ.', 'Nanage nīli baṇṇa iṣṭa.', 'I like the color blue.')]),
      lesson('kn-animals', 'Animals', 2, '🐾', [
        v('ನಾಯಿ', 'nāyi', 'Dog', '🐕'), v('ಬೆಕ್ಕು', 'bekku', 'Cat', '🐈'), v('ಹಸು', 'hasu', 'Cow', '🐄'), v('ಆನೆ', 'āne', 'Elephant', '🐘'), v('ಹಕ್ಕಿ', 'hakki', 'Bird', '🐦')
      ], [d('ನಿಮಗೆ ಯಾವ ಪ್ರಾಣಿ ಇಷ್ಟ?', 'Nimage yāva prāṇi iṣṭa?', 'Which animal do you like?'), d('ನನಗೆ ಆನೆ ಇಷ್ಟ.', 'Nanage āne iṣṭa.', 'I like elephants.'), d('ಆ ಹಕ್ಕಿ ಸುಂದರವಾಗಿದೆ.', 'Ā hakki sundaravāgide.', 'That bird is beautiful.')]),
      lesson('kn-food', 'Food and likes', 2, '🍚', [
        v('ಅನ್ನ', 'anna', 'Cooked rice', '🍚'), v('ಇಡ್ಲಿ', 'iḍli', 'Idli', '🥮'), v('ನೀರು', 'nīru', 'Water', '💧'), v('ಹಣ್ಣು', 'haṇṇu', 'Fruit', '🍎'), v('ಹಸಿವು', 'hasivu', 'Hunger', '😋')
      ], [d('ನಿಮಗೆ ಏನು ಬೇಕು?', 'Nimage ēnu bēku?', 'What would you like?'), d('ನನಗೆ ಇಡ್ಲಿ ಮತ್ತು ನೀರು ಬೇಕು.', 'Nanage iḍli mattu nīru bēku.', 'I would like idli and water.'), d('ನನಗೆ ಮಾವಿನಹಣ್ಣು ಇಷ್ಟ.', 'Nanage māvinahaṇṇu iṣṭa.', 'I like mango.')]),
      lesson('kn-school', 'At school', 2, '🏫', [
        v('ಶಾಲೆ', 'śāle', 'School', '🏫'), v('ಶಿಕ್ಷಕರು', 'śikṣakaru', 'Teacher', '🧑‍🏫'), v('ವಿದ್ಯಾರ್ಥಿ', 'vidyārthi', 'Student', '🧑‍🎓'), v('ಪುಸ್ತಕ', 'pustaka', 'Book', '📘'), v('ಪೆನ್ಸಿಲ್', 'pensil', 'Pencil', '✏️')
      ], [d('ನಿಮ್ಮ ಶಾಲೆ ಎಲ್ಲಿದೆ?', 'Nimma śāle ellide?', 'Where is your school?'), d('ನನ್ನ ಶಾಲೆ ಹತ್ತಿರದಲ್ಲಿದೆ.', 'Nanna śāle hattiradallide.', 'My school is nearby.'), d('ಶಿಕ್ಷಕರು ಪುಸ್ತಕ ತೆರೆಯಲು ಹೇಳುತ್ತಾರೆ.', 'Śikṣakaru pustaka tereyalu hēḷuttāre.', 'The teacher asks us to open the book.')]),
      lesson('kn-polite', 'Polite requests', 2, '🙏', [
        v('ದಯವಿಟ್ಟು', 'dayaviṭṭu', 'Please', '🙏'), v('ಸ್ವಲ್ಪ', 'svalpa', 'A little', '🤏'), v('ನಿಧಾನವಾಗಿ', 'nidhānavāgi', 'Slowly', '🐢'), v('ಮತ್ತೆ', 'matte', 'Again', '🔁'), v('ಕ್ಷಮಿಸಿ', 'kṣamisi', 'Excuse me / sorry', '🙇')
      ], [d('ದಯವಿಟ್ಟು ನಿಧಾನವಾಗಿ ಮಾತನಾಡಿ.', 'Dayaviṭṭu nidhānavāgi mātanāḍi.', 'Please speak slowly.'), d('ಇದನ್ನು ಮತ್ತೆ ಹೇಳಬಹುದೇ?', 'Idannu matte hēḷabahudē?', 'Could you say that again?'), d('ಕ್ಷಮಿಸಿ, ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ.', 'Kṣamisi, nanage arthavāgalilla.', 'Sorry, I did not understand.')]),
      lesson('kn-directions', 'Finding the way', 3, '🧭', [
        v('ಎಲ್ಲಿ?', 'elli?', 'Where?', '❓'), v('ಬಲಕ್ಕೆ', 'balakke', 'To the right', '➡️'), v('ಎಡಕ್ಕೆ', 'eḍakke', 'To the left', '⬅️'), v('ನೇರವಾಗಿ', 'nēravāgi', 'Straight ahead', '⬆️'), v('ಹತ್ತಿರ', 'hattira', 'Nearby', '📍')
      ], [d('ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?', 'Bas nildāṇa ellide?', 'Where is the bus stop?'), d('ನೇರವಾಗಿ ಹೋಗಿ, ಎಡಕ್ಕೆ ತಿರುಗಿ.', 'Nēravāgi hōgi, eḍakke tirugi.', 'Go straight and turn left.'), d('ಧನ್ಯವಾದಗಳು! ಅದು ಹತ್ತಿರದಲ್ಲಿದೆಯೇ?', 'Dhanyavādagaḷu! Adu hattiradallideyē?', 'Thank you! Is it nearby?')]),
      lesson('kn-routine', 'My daily routine', 3, '⏰', [
        v('ಬೆಳಗ್ಗೆ', 'beḷagge', 'Morning', '🌅'), v('ಏಳು', 'ēḷu', 'Wake up', '⏰'), v('ತಿನ್ನು', 'tinnu', 'Eat', '🍽️'), v('ಓದು', 'ōdu', 'Study / read', '📖'), v('ರಾತ್ರಿ', 'rātri', 'Night', '🌙')
      ], [d('ನಾನು ಬೆಳಗ್ಗೆ ಬೇಗ ಏಳುತ್ತೇನೆ.', 'Nānu beḷagge bēga ēḷuttēne.', 'I wake up early in the morning.'), d('ಶಾಲೆಯ ನಂತರ ಓದುತ್ತೇನೆ.', 'Śāleya nantara ōduttēne.', 'I study after school.'), d('ನೀವು ರಾತ್ರಿ ಏನು ಮಾಡುತ್ತೀರಿ?', 'Nīvu rātri ēnu māḍuttīri?', 'What do you do at night?')]),
      lesson('kn-chat', 'A simple conversation', 3, '💬', [
        v('ಇಂದು', 'indu', 'Today', '📅'), v('ಚೆನ್ನಾಗಿದೆ', 'cennāgide', 'Good / nice', '✨'), v('ಇಷ್ಟ', 'iṣṭa', 'Like', '❤️'), v('ಆಟ', 'āṭa', 'Play / game', '⚽'), v('ನಾಳೆ', 'nāḷe', 'Tomorrow', '🌤️')
      ], [d('ಇಂದು ಶಾಲೆ ಹೇಗಿತ್ತು?', 'Indu śāle hēgittu?', 'How was school today?'), d('ಚೆನ್ನಾಗಿತ್ತು. ಸ್ನೇಹಿತರ ಜೊತೆ ಆಟವಾಡಿದೆ.', 'Cennāgittu. Snēhitar jote āṭavāḍide.', 'It was good. I played with friends.'), d('ನಾಳೆ ಮತ್ತೆ ಸಿಗೋಣ!', 'Nāḷe matte sigōṇa!', 'See you again tomorrow!')]),
      lesson('kn-home', 'Rooms at home', 4, '🏠', [
        v('ಮನೆ', 'mane', 'Home', '🏠'),
        v('ಕೋಣೆ', 'kōṇe', 'Room', '🚪'),
        v('ಅಡಿಗೆಮನೆ', 'aḍigemane', 'Kitchen', '🍳'),
        v('ಮಲಗುವ ಕೋಣೆ', 'malaguva kōṇe', 'Bedroom', '🛏️'),
        v('ಬಾಗಿಲು', 'bāgilu', 'Door', '🚪'),
        v('ಕಿಟಕಿ', 'kiṭaki', 'Window', '🪟')
      ], [
        d('ಬನ್ನಿ, ಇದು ನಮ್ಮ ಮನೆ.', 'Banni, idu namma mane.', 'Come in. This is our home.'),
        d('ಅಡಿಗೆಮನೆ ಎಲ್ಲಿದೆ?', 'Aḍigemane ellide?', 'Where is the kitchen?'),
        d('ಅಡಿಗೆಮನೆ ಬಲಕ್ಕಿದೆ.', 'Aḍigemane balakkide.', 'The kitchen is on the right.'),
        d('ಈ ಕೋಣೆಯಲ್ಲಿ ದೊಡ್ಡ ಕಿಟಕಿ ಇದೆ!', 'Ī kōṇeyalli doḍḍa kiṭaki ide!', 'There’s a big window in this room!')
      ]),
      lesson('kn-clothes', 'What to wear', 4, '👕', [
        v('ಬಟ್ಟೆ', 'baṭṭe', 'Clothing', '👚'),
        v('ಅಂಗಿ', 'aṅgi', 'Shirt', '👕'),
        v('ಪ್ಯಾಂಟ್', 'pyāṇṭ', 'Trousers', '👖'),
        v('ಟೋಪಿ', 'ṭōpi', 'Hat', '🧢'),
        v('ಚಪ್ಪಲಿ', 'cappali', 'Sandals', '🩴'),
        v('ಹಾಕಿಕೊಳ್ಳಿ', 'hākikoḷḷi', 'Put it on (polite)', '🧥')
      ], [
        d('ನನ್ನ ನೀಲಿ ಅಂಗಿ ಎಲ್ಲಿದೆ?', 'Nanna nīli aṅgi ellide?', 'Where is my blue shirt?'),
        d('ಅದು ಮಲಗುವ ಕೋಣೆಯಲ್ಲಿದೆ.', 'Adu malaguva kōṇeyallide.', 'It’s in the bedroom.'),
        d('ಈ ಟೋಪಿಯನ್ನೂ ಹಾಕಿಕೊಳ್ಳಲೇ?', 'Ī ṭōpiyannū hākikoḷḷalē?', 'Shall I put on this hat too?'),
        d('ಹೌದು, ಹಾಕಿಕೊಳ್ಳಿ. ಹೊರಗೆ ಬಿಸಿಲಿದೆ.', 'Haudu, hākikoḷḷi. Horage bisilide.', 'Yes, put it on. It’s sunny outside.')
      ]),
      lesson('kn-weather', 'Weather and seasons', 4, '🌦️', [
        v('ಮಳೆ', 'maḷe', 'Rain', '🌧️'),
        v('ಬಿಸಿಲು', 'bisilu', 'Sunshine', '☀️'),
        v('ಚಳಿ', 'caḷi', 'Cold weather', '🥶'),
        v('ಬೇಸಿಗೆ', 'bēsige', 'Summer', '🏖️'),
        v('ಮಳೆಗಾಲ', 'maḷegāla', 'Rainy season', '🌦️'),
        v('ಛತ್ರಿ', 'chatri', 'Umbrella', '☂️')
      ], [
        d('ಹೊರಗೆ ಮಳೆ ಬರುತ್ತಿದೆಯಾ?', 'Horage maḷe baruttideyā?', 'Is it raining outside?'),
        d('ಹೌದು, ಈಗ ಮಳೆಗಾಲ.', 'Haudu, īga maḷegāla.', 'Yes, it’s the rainy season now.'),
        d('ಹಾಗಾದರೆ ಛತ್ರಿ ತೆಗೆದುಕೊಂಡು ಹೋಗೋಣ.', 'Hāgādare chatri tegedukoṇḍu hōgōṇa.', 'Then let’s take an umbrella.'),
        d('ಸರಿ, ಛತ್ರಿ ಬಾಗಿಲಿನ ಹತ್ತಿರ ಇದೆ.', 'Sari, chatri bāgilina hattira ide.', 'Okay, the umbrella is near the door.')
      ]),
      lesson('kn-feelings', 'Body and feelings', 4, '🙂', [
        v('ಕೈ', 'kai', 'Hand', '✋'),
        v('ಕಾಲು', 'kālu', 'Leg', '🦵'),
        v('ಕಣ್ಣು', 'kaṇṇu', 'Eye', '👁️'),
        v('ನನಗೆ ಖುಷಿಯಾಗಿದೆ', 'nanage khuṣiyāgide', 'I’m happy', '😊'),
        v('ನನಗೆ ದಣಿವಾಗಿದೆ', 'nanage daṇivāgide', 'I’m tired', '😮‍💨'),
        v('ನನಗೆ ಭಯವಾಗುತ್ತಿದೆ', 'nanage bhayavāguttide', 'I’m scared', '😨')
      ], [
        d('ನೃತ್ಯ ಹೇಗಿತ್ತು?', 'Nṛtya hēgittu?', 'How was the dance?'),
        d('ತುಂಬಾ ಚೆನ್ನಾಗಿತ್ತು! ನನಗೆ ಖುಷಿಯಾಗಿದೆ.', 'Tumbā cennāgittu! Nanage khuṣiyāgide.', 'It was great! I’m happy.'),
        d('ನನಗೂ ಖುಷಿಯಾಗಿದೆ. ಈಗ ಸ್ವಲ್ಪ ದಣಿವಾಗಿದೆ.', 'Nanagū khuṣiyāgide. Īga svalpa daṇivāgide.', 'I’m happy too. I’m a little tired now.'),
        d('ಬನ್ನಿ, ಇಲ್ಲಿ ಕುಳಿತುಕೊಳ್ಳೋಣ.', 'Banni, illi kuḷitukoḷḷōṇa.', 'Come, let’s sit here.')
      ]),
      lesson('kn-time', 'Days and clock times', 5, '🕒', [
        v('ಸೋಮವಾರ', 'sōmavāra', 'Monday', '📅'),
        v('ಶನಿವಾರ', 'śanivāra', 'Saturday', '📅'),
        v('ಭಾನುವಾರ', 'bhānuvāra', 'Sunday', '📅'),
        v('ಸಂಜೆ', 'sanje', 'Evening', '🌆'),
        v('ಎಷ್ಟು ಗಂಟೆಗೆ?', 'eṣṭu gaṇṭege?', 'At what time?', '🕒'),
        v('ಐದು ಗಂಟೆಗೆ', 'aidu gaṇṭege', 'At five o’clock', '🕔')
      ], [
        d('ತರಗತಿ ಯಾವ ದಿನ?', 'Taragati yāva dina?', 'What day is the class?'),
        d('ಶನಿವಾರ.', 'Śanivāra.', 'Saturday.'),
        d('ಎಷ್ಟು ಗಂಟೆಗೆ?', 'Eṣṭu gaṇṭege?', 'At what time?'),
        d('ಸಂಜೆ ಐದು ಗಂಟೆಗೆ.', 'Sanje aidu gaṇṭege.', 'At five in the evening.')
      ]),
      lesson('kn-market', 'Shopping at the market', 5, '🛒', [
        v('ಮಾರುಕಟ್ಟೆ', 'mārukaṭṭe', 'Market', '🛒'),
        v('ತರಕಾರಿ', 'tarakāri', 'Vegetables', '🥕'),
        v('ಟೊಮ್ಯಾಟೊ', 'ṭomyāṭo', 'Tomato', '🍅'),
        v('ಬೆಲೆ ಎಷ್ಟು?', 'bele eṣṭu?', 'How much does it cost?', '🏷️'),
        v('ಅರ್ಧ ಕಿಲೋ', 'ardha kilō', 'Half a kilo', '⚖️'),
        v('ಕೊಡಿ', 'koḍi', 'Please give', '🤲')
      ], [
        d('ಟೊಮ್ಯಾಟೊ ಬೆಲೆ ಎಷ್ಟು?', 'Ṭomyāṭo bele eṣṭu?', 'How much are the tomatoes?'),
        d('ಒಂದು ಕಿಲೋಗೆ ನಲವತ್ತು ರೂಪಾಯಿ.', 'Ondu kilōge nalavattu rūpāyi.', 'Forty rupees for one kilo.'),
        d('ಅರ್ಧ ಕಿಲೋ ಕೊಡಿ.', 'Ardha kilō koḍi.', 'Half a kilo, please.'),
        d('ತಗೊಳ್ಳಿ. ಇಪ್ಪತ್ತು ರೂಪಾಯಿ.', 'Tagoḷḷi. Ippattu rūpāyi.', 'Here you are. Twenty rupees.')
      ]),
      lesson('kn-travel', 'Taking the bus', 5, '🚌', [
        v('ಬಸ್', 'bas', 'Bus', '🚌'),
        v('ಬಸ್ ನಿಲ್ದಾಣ', 'bas nildāṇa', 'Bus stop', '🚏'),
        v('ರೈಲು', 'railu', 'Train', '🚆'),
        v('ಟಿಕೆಟ್', 'ṭikeṭ', 'Ticket', '🎫'),
        v('ಇಲ್ಲೇ ಇಳಿಯಿರಿ', 'illē iḷiyiri', 'Get off right here (polite)', '🚶'),
        v('ಮುಂದಿನ ನಿಲ್ದಾಣ', 'mundina nildāṇa', 'Next stop', '📍')
      ], [
        d('ಈ ಬಸ್ ಮಾರುಕಟ್ಟೆಗೆ ಹೋಗುತ್ತದೆಯಾ?', 'Ī bas mārukaṭṭege hōguttadeyā?', 'Does this bus go to the market?'),
        d('ಹೌದು, ಮಾರುಕಟ್ಟೆ ಮುಂದಿನ ನಿಲ್ದಾಣ.', 'Haudu, mārukaṭṭe mundina nildāṇa.', 'Yes, the market is the next stop.'),
        d('ಮಾರುಕಟ್ಟೆಗೆ ಒಂದು ಟಿಕೆಟ್ ಕೊಡಿ.', 'Mārukaṭṭege ondu ṭikeṭ koḍi.', 'One ticket to the market, please.'),
        d('ತಗೊಳ್ಳಿ. ಮಾರುಕಟ್ಟೆ ಬಂತು. ಇಲ್ಲೇ ಇಳಿಯಿರಿ.', 'Tagoḷḷi. Mārukaṭṭe bantu. Illē iḷiyiri.', 'Here you are. We’re at the market. Get off here.')
      ]),
      lesson('kn-sports', 'Games and sports', 5, '⚽', [
        v('ಚೆಂಡು', 'ceṇḍu', 'Ball', '⚽'),
        v('ಕ್ರಿಕೆಟ್', 'krikeṭ', 'Cricket', '🏏'),
        v('ಫುಟ್‌ಬಾಲ್', 'phuṭbāl', 'Football', '⚽'),
        v('ಮೈದಾನ', 'maidāna', 'Playing field', '🏟️'),
        v('ತಂಡ', 'taṇḍa', 'Team', '🤝'),
        v('ಆಡೋಣ', 'āḍōṇa', 'Let’s play', '🎮')
      ], [
        d('ನಿಮಗೆ ಯಾವ ಆಟ ಇಷ್ಟ?', 'Nimage yāva āṭa iṣṭa?', 'Which game do you like?'),
        d('ನನಗೆ ಕ್ರಿಕೆಟ್ ಇಷ್ಟ. ನಿಮಗೆ?', 'Nanage krikeṭ iṣṭa. Nimage?', 'I like cricket. How about you?'),
        d('ನನಗೂ ಕ್ರಿಕೆಟ್ ಇಷ್ಟ. ಮೈದಾನದಲ್ಲಿ ಆಡೋಣವಾ?', 'Nanagū krikeṭ iṣṭa. Maidānadalli āḍōṇavā?', 'I like cricket too. Shall we play on the field?'),
        d('ಸರಿ, ನಾನು ಚೆಂಡು ತರುತ್ತೇನೆ.', 'Sari, nānu ceṇḍu taruttēne.', 'Okay, I’ll bring the ball.')
      ]),
      lesson('kn-invite', 'Inviting a friend', 6, '💌', [
        v('ಭಾನುವಾರ ಬಿಡುವಿದೆಯಾ?', 'bhānuvāra biḍuvideyā?', 'Are you free on Sunday?', '📅'),
        v('ನಮ್ಮ ಮನೆಗೆ ಬನ್ನಿ', 'namma manege banni', 'Come over to our house', '🏠'),
        v('ಊಟಕ್ಕೆ', 'ūṭakke', 'For a meal', '🍽️'),
        v('ಖಂಡಿತ', 'khaṇḍita', 'Definitely', '✅'),
        v('ಬರುತ್ತೇನೆ', 'baruttēne', 'I’ll come', '🚶'),
        v('ಮಧ್ಯಾಹ್ನ', 'madhyāhna', 'Afternoon / noon', '☀️')
      ], [
        d('ಭಾನುವಾರ ಬಿಡುವಿದೆಯಾ?', 'Bhānuvāra biḍuvideyā?', 'Are you free on Sunday?'),
        d('ಹೌದು, ಭಾನುವಾರ ಬಿಡುವಿದೆ.', 'Haudu, bhānuvāra biḍuvide.', 'Yes, I’m free on Sunday.'),
        d('ಮಧ್ಯಾಹ್ನ ಊಟಕ್ಕೆ ನಮ್ಮ ಮನೆಗೆ ಬನ್ನಿ.', 'Madhyāhna ūṭakke namma manege banni.', 'Come over to our house for lunch.'),
        d('ಧನ್ಯವಾದಗಳು. ಖಂಡಿತ ಬರುತ್ತೇನೆ!', 'Dhanyavādagaḷu. Khaṇḍita baruttēne!', 'Thank you. I’ll definitely come!')
      ]),
      lesson('kn-yesterday', 'What I did yesterday', 6, '📅', [
        v('ನಿನ್ನೆ', 'ninne', 'Yesterday', '📅'),
        v('ಹೋದೆ', 'hōde', 'I went', '🚶'),
        v('ನೋಡಿದೆ', 'nōḍide', 'I saw / watched', '👀'),
        v('ಕೊಂಡೆ', 'koṇḍe', 'I bought', '🛍️'),
        v('ಬಂದೆ', 'bande', 'I came', '👋'),
        v('ಆಮೇಲೆ', 'āmēle', 'After that', '➡️')
      ], [
        d('ನಿನ್ನೆ ಎಲ್ಲಿಗೆ ಹೋದಿರಿ?', 'Ninne ellige hōdiri?', 'Where did you go yesterday?'),
        d('ಮಾರುಕಟ್ಟೆಗೆ ಹೋದೆ. ಅಲ್ಲಿ ಟೊಮ್ಯಾಟೊ ಕೊಂಡೆ.', 'Mārukaṭṭege hōde. Alli ṭomyāṭo koṇḍe.', 'I went to the market. I bought tomatoes there.'),
        d('ಆಮೇಲೆ ಏನು ಮಾಡಿದಿರಿ?', 'Āmēle ēnu māḍidiri?', 'What did you do after that?'),
        d('ಮನೆಗೆ ಬಂದೆ. ಸಂಜೆ ಒಂದು ಸಿನಿಮಾ ನೋಡಿದೆ.', 'Manege bande. Sanje ondu sinimā nōḍide.', 'I came home. I watched a film in the evening.')
      ]),
      lesson('kn-tomorrow', 'Plans for tomorrow', 6, '🌤️', [
        v('ನಾಳೆ ಬೆಳಗ್ಗೆ', 'nāḷe beḷagge', 'Tomorrow morning', '🌅'),
        v('ಹೋಗುತ್ತೇನೆ', 'hōguttēne', 'I’ll go', '🚶'),
        v('ಭೇಟಿಯಾಗೋಣ', 'bhēṭiyāgōṇa', 'Let’s meet', '🤝'),
        v('ಎಲ್ಲಿ ಭೇಟಿಯಾಗೋಣ?', 'elli bhēṭiyāgōṇa?', 'Where shall we meet?', '📍'),
        v('ಅಲ್ಲೇ', 'allē', 'Right there', '📌'),
        v('ಒಟ್ಟಿಗೆ', 'oṭṭige', 'Together', '👫')
      ], [
        d('ನಾಳೆ ಬೆಳಗ್ಗೆ ಏನು ಮಾಡುತ್ತೀರಿ?', 'Nāḷe beḷagge ēnu māḍuttīri?', 'What are you doing tomorrow morning?'),
        d('ಮೈದಾನಕ್ಕೆ ಹೋಗುತ್ತೇನೆ. ಒಟ್ಟಿಗೆ ಹೋಗೋಣವಾ?', 'Maidānakke hōguttēne. Oṭṭige hōgōṇavā?', 'I’m going to the playing field. Shall we go together?'),
        d('ಸರಿ. ಎಲ್ಲಿ ಭೇಟಿಯಾಗೋಣ?', 'Sari. Elli bhēṭiyāgōṇa?', 'Sure. Where shall we meet?'),
        d('ಬಸ್ ನಿಲ್ದಾಣದ ಹತ್ತಿರ ಭೇಟಿಯಾಗೋಣ.', 'Bas nildāṇada hattira bhēṭiyāgōṇa.', 'Let’s meet near the bus stop.'),
        d('ಸರಿ, ನಾಳೆ ಬೆಳಗ್ಗೆ ಅಲ್ಲೇ ಸಿಗೋಣ.', 'Sari, nāḷe beḷagge allē sigōṇa.', 'Okay, see you there tomorrow morning.')
      ]),
      lesson('kn-help', 'Asking for help', 6, '🤝', [
        v('ಸಹಾಯ ಮಾಡಿ', 'sahāya māḍi', 'Please help', '🤝'),
        v('ತೋರಿಸುತ್ತೀರಾ?', 'tōrisuttīrā?', 'Could you show me?', '👆'),
        v('ದಾರಿ', 'dāri', 'Way / route', '🧭'),
        v('ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ', 'nanage arthavāgalilla', 'I didn’t understand', '🤔'),
        v('ಇನ್ನೊಮ್ಮೆ ಹೇಳಿ', 'innomme hēḷi', 'Please say it once more', '🔁'),
        v('ಈಗ ಅರ್ಥವಾಯಿತು', 'īga arthavāyitu', 'Now I understand', '💡')
      ], [
        d('ಕ್ಷಮಿಸಿ, ಬಸ್ ನಿಲ್ದಾಣಕ್ಕೆ ದಾರಿ ತೋರಿಸುತ್ತೀರಾ?', 'Kṣamisi, bas nildāṇakke dāri tōrisuttīrā?', 'Excuse me, could you show me the way to the bus stop?'),
        d('ನೇರವಾಗಿ ಹೋಗಿ, ಮಾರುಕಟ್ಟೆಯ ಹತ್ತಿರ ಎಡಕ್ಕೆ ತಿರುಗಿ.', 'Nēravāgi hōgi, mārukaṭṭeya hattira eḍakke tirugi.', 'Go straight and turn left near the market.'),
        d('ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಇನ್ನೊಮ್ಮೆ ಹೇಳಿ.', 'Nanage arthavāgalilla. Dayaviṭṭu innomme hēḷi.', 'I didn’t understand. Please say it once more.'),
        d('ಆ ಮಾರುಕಟ್ಟೆ ಕಾಣುತ್ತಿದೆಯಾ? ಅಲ್ಲಿ ಎಡಕ್ಕೆ ತಿರುಗಿ.', 'Ā mārukaṭṭe kāṇuttideyā? Alli eḍakke tirugi.', 'Can you see that market? Turn left there.'),
        d('ಈಗ ಅರ್ಥವಾಯಿತು. ಧನ್ಯವಾದಗಳು!', 'Īga arthavāyitu. Dhanyavādagaḷu!', 'Now I understand. Thank you!')
      ])
    ]
  }
};
