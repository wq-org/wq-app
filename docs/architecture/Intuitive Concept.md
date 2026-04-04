# Concepts

<aside>
<img src="notion://custom_emoji/45750dd6-fd24-4e2a-8f93-c51af245bc48/2014b70c-a399-8029-93aa-007ae1120ca1" alt="notion://custom_emoji/45750dd6-fd24-4e2a-8f93-c51af245bc48/2014b70c-a399-8029-93aa-007ae1120ca1" width="40px" />

# context autofill

Große Produkte fühlen sich „magisch“ an, weil sie dem Nutzer Arbeit wegnehmen, bevor er merkt, dass Arbeit nötig wäre. Apple ist darin berühmt. Dahinter steckt kein Zauber, sondern eine simple Regel: Der Computer erkennt Kontext und schlägt die wahrscheinlichste Aktion sofort vor.

Wenn man das auf deinen Game-Builder überträgt, geht es also nicht um mehr Features, sondern um kluge Automatisierungen.

Ein paar bekannte Muster aus großen Tech-Produkten zeigen das gut.

# Prinzip Context Autofill

Apple hat zum Beispiel das Prinzip Context Autofill perfektioniert. Wenn ein SMS-Code kommt, erkennt das System automatisch die Zahlenfolge und schlägt sie direkt im Eingabefeld vor. Der Nutzer muss nichts kopieren. Das gleiche passiert bei E-Mail-Adressen, Passwörtern oder Kreditkarten. Der Trick ist: Das System versteht, was gerade passieren soll.

Übertragen auf deinen Builder bedeutet das: Wenn ein Lehrer ein PDF hochlädt und darin steht „A1 Beschreiben Sie…“, erkennt dein System automatisch eine offene Frage und schlägt sofort einen passenden Spieltyp vor. Der Lehrer bestätigt nur noch.

# Google Smart Reply

Google arbeitet stark mit Predictive Suggestions. In Gmail werden Antworten automatisch vorgeschlagen („Smart Reply“). In der Suche wird die Anfrage während des Tippens vervollständigt. Der Nutzer merkt nicht einmal, dass er weniger tippt.

Für dein System könnte das heißen: Sobald ein Lehrer eine Aufgabe schreibt wie „Ordnen Sie die Begriffe…“, schlägt dein Editor automatisch ein Matching-Game vor.

Figma nutzt ein Prinzip, das man Drag Intelligence nennen könnte. Wenn du ein Objekt bewegst, zeigt Figma automatisch Hilfslinien, Abstände und Ausrichtung an. Der Nutzer muss nichts messen.

Übertragen: Wenn ein Lehrer ein Bild in den Editor zieht, erkennt dein System automatisch mögliche Interaktionen:

„Dieses Bild könnte ein Image-Pin-Game sein.“

Notion ist berühmt für Slash Commands. Der Nutzer tippt nur „/image“ oder „/table“ und bekommt sofort passende Blöcke vorgeschlagen. Das reduziert die UI-Komplexität enorm.

In deinem Builder könnte das heißen:

Tippt jemand „/quiz“, erscheint direkt eine Multiple-Choice-Game-Komponente.

Spotify nutzt Implicit Learning. Das System merkt sich dein Verhalten und verbessert automatisch Vorschläge. Nutzer müssen nichts konfigurieren.

Bei dir könnte das bedeuten: Wenn Lehrer häufig bestimmte Spieltypen mit Diagrammen kombinieren, schlägt das System diese Kombination künftig automatisch vor.

Ein weiteres starkes Muster ist Preview Before Commit, das Apple oft nutzt. Bevor man eine Änderung bestätigt, sieht man sofort eine Vorschau.

Für deinen Builder wäre das extrem wertvoll: Sobald ein Game automatisch generiert wurde, zeigt das System sofort eine spielbare Vorschau.

Ein Klassiker aus vielen großen Tools ist Inline Editing. Apple Notes oder Notion lassen dich Inhalte direkt bearbeiten, ohne Moduswechsel. Kein „Edit-Button“, kein Popup.

Eine der stärksten Ideen kommt aus Design-Forschung wie dem MDA-Framework: Spiele funktionieren dann gut, wenn Mechaniken direkt auf die gewünschte Spielerfahrung ausgerichtet sind. Das bedeutet, Features sollten nicht isoliert entstehen, sondern direkt eine gewünschte Lern-Interaktion erzeugen.

Für deinen Builder heißt das: Die Technik sollte automatisch erkennen, welche Interaktion aus dem Material entstehen kann.

Wenn man das alles zusammenfasst, entstehen fünf extrem starke „Apple-artige“ Featureprinzipien für dein System:

Der Computer erkennt Struktur automatisch.

Der Computer schlägt die wahrscheinlichste Aktion vor.

Der Nutzer bestätigt nur noch.

Alles ist sofort editierbar.

Alles ist sofort previewbar.

Die spannendste Vision für deinen Builder wäre deshalb:

Ein Lehrer lädt ein PDF hoch.

Das System erkennt Text, Fragen und Bilder.

Es generiert automatisch drei mögliche Spiele.

Der Lehrer klickt auf eines.

Fertig.

Wenn du diese Art von „Zero Effort Interaction“ erreichst, fühlt sich dein Tool nicht wie Software an – sondern wie ein Assistent.

</aside>

<aside>
<img src="notion://custom_emoji/45750dd6-fd24-4e2a-8f93-c51af245bc48/2014b70c-a399-8029-93aa-007ae1120ca1" alt="notion://custom_emoji/45750dd6-fd24-4e2a-8f93-c51af245bc48/2014b70c-a399-8029-93aa-007ae1120ca1" width="40px" />

PDFs sind in der Schule das dominante Format. Lehrer haben über Jahre Material angesammelt. Wenn dein System verlangt, dass sie alles neu schreiben, verlieren sie sofort das Interesse. Wenn dein System hingegen sagt: „Lade dein PDF hoch, wir machen daraus eine bearbeitbare Lesson“, dann nimmst du ihnen Arbeit ab. Das ist echtes Produktdenken.

Überschrift, Absatz, Bild, Tabelle, Aufgabe. Diese Elemente werden dann automatisch in deine Lesson-Blöcke übersetzt. Ein Textblock wird zu einem Text-Block im Editor, ein Bild zu einem Image-Block, ein Diagramm zu einem Bild mit Annotation-Option

Ein schönes mentales Modell dafür ist: Dein System verwandelt PDFs von „toten Dokumenten“ in „lebendige Lektionen“. Das PDF ist nur der Rohstoff. Die Lesson-Page ist das neue Medium.

Wenn man sich deine Beispiele anschaut – „Das Europäische Parlament“ und „Die wichtigsten Institutionen der EU“ – sieht man typische Muster. Überschrift, kurzer Erklärungstext, Grafiken, dann Aufgaben A1–A4 mit Linien zum Schreiben. Das ist die Grammatik eines Schul-PDFs. Wenn du daraus ein System bauen willst, das Lehrer wirklich benutzen, musst du diese Grammatik verstehen und automatisieren.

Die wichtigste Erkenntnis aus How to Build Products People Actually Buy und aus The Mom Test ist simpel: Menschen kaufen keine Features, sie kaufen Zeitersparnis und weniger Frustration. Deine Lehrerin hat dir bereits die Wahrheit gesagt – sie hat nur etwa zwei bis drei Stunden pro Woche Zeit für Material. Wenn dein Tool ihr diese Zeit halbiert, gewinnt dein Produkt.

Darum sollte dein Worksheet-Builder nicht einfach „PDF importieren“. Er muss die Struktur erkennen und sofort interaktive Aufgaben vorschlagen.

Stell dir den Workflow so vor:

Die Lehrerin lädt das PDF hoch. Der Worker analysiert die Seite. Das System erkennt automatisch vier Dinge: Textblöcke, Bilder/Grafiken, Fragen und Antwortbereiche. Danach schlägt es automatisch passende Spieltypen vor.

Bei A1 „Beschreiben Sie…“ erkennt das System eine offene Frage und schlägt automatisch ein „ShortAnswerGame“ vor.

Bei A2 mit einer Grafik erkennt das System ein Bild und schlägt „ImageHotspotGame“ oder „ImageAnnotationGame“ vor.

Bei A3 mit erklärenden Aufgaben schlägt es „TextLineSelectGame“ oder „KeywordSentenceGame“ vor.

Der entscheidende Punkt ist also nicht der Import, sondern die Transformation.

Ein guter Worksheet-Builder für dein System braucht deshalb ein paar zentrale Features.

Das erste ist automatische Aufgabenerkennung. Der Parser erkennt Muster wie „A1“, „A2“, „Beschreiben Sie“, „Erklären Sie“. Daraus wird automatisch ein Aufgabenblock. Der Lehrer kann ihn dann nur noch bestätigen oder ändern.

Das zweite ist eine automatische Spielvorschlag-Engine. Wenn ein Bild erkannt wird, schlägt das System ein Bildspiel vor. Wenn mehrere Begriffe auftauchen, schlägt es Matching vor. Wenn ein längerer Text vorhanden ist, schlägt es Markierungsaufgaben vor.

Das dritte ist Bild-Interaktivität. In deinen PDFs sind viele Diagramme. Lehrer müssen Pins setzen können, Bereiche markieren oder Beschriftungen zuordnen. Das ist perfekt für dein ImageHotspotGame oder ImageAnnotationGame.

Das vierte ist automatische Antwortfelder. Die Linien in einem Arbeitsblatt sind eigentlich nur Platzhalter für Antworten. Dein System sollte sie erkennen und daraus direkt Inputfelder machen.

Das fünfte ist Differenzierung. Die Lehrerin hat explizit gesagt, dass sie unterschiedliche Leistungsniveaus braucht. Deshalb sollte jede Aufgabe drei Varianten haben können: einfache Sprache, normale Schwierigkeit, schwierigere Version.

Das sechste ist Medien-Augmentation. Ein statisches PDF kann durch kurze Videos, Animationen oder erklärende Hinweise erweitert werden. Das macht aus einem trockenen Arbeitsblatt eine interaktive Lektion.

Das siebte ist Lernfeedback. Nach jeder Antwort sollte eine Erklärung erscheinen. Das erhöht den Lerneffekt enorm, besonders bei Fehlern.

Das achte ist Progress Tracking. Lehrer wollen sehen, welche Aufgaben ihre Schüler nicht verstanden haben.

Das neunte ist Layout-Import. Dein System sollte das originale PDF-Layout anzeigen, damit Lehrer sehen, wo die Inhalte herkommen. Von dort können sie Elemente per Drag-and-Drop in ein Spiel ziehen.

Das zehnte ist automatische Modulbildung. Wenn mehrere Aufgaben zusammengehören, erzeugt das System automatisch ein Lernmodul oder eine Lektion.

Wenn man das Ganze technisch denkt, sieht die Pipeline ungefähr so aus:

PDF wird hochgeladen.

Ein Python-Worker analysiert die Seite.

Der Worker extrahiert Textblöcke, Bilder, Tabellen und Links.

Der Worker erkennt Aufgabenmuster.

Der Worker generiert JSON-Blöcke für dein Frontend.

Das Frontend zeigt diese Blöcke als Drag-Elemente im Worksheet-Builder.

Das Resultat ist dann kein statisches Dokument mehr, sondern ein Baukasten aus Aufgaben.

Und genau dort entsteht der eigentliche Wert deines Produkts. Nicht beim PDF-Import, sondern bei der Frage: „Wie schnell kann eine Lehrerin aus diesem Dokument eine interaktive Lektion bauen?“

Wenn du willst, kann ich dir auch noch zeigen, welche drei Killer-Features dein Worksheet-Builder unbedingt haben muss, damit Lehrer sofort verstehen: „Das spart mir jede Woche Stunden.“ Diese drei entscheiden später, ob dein Produkt benutzt wird oder nur ein schönes Projekt bleibt.

</aside>

<aside>
<img src="notion://custom_emoji/45750dd6-fd24-4e2a-8f93-c51af245bc48/2014b70c-a399-8029-93aa-007ae1120ca1" alt="notion://custom_emoji/45750dd6-fd24-4e2a-8f93-c51af245bc48/2014b70c-a399-8029-93aa-007ae1120ca1" width="40px" />

Godfred, das ist eine sehr gute Produktfrage. Und die Antwort liegt genau im Spannungsfeld zwischen Automatisierung und Kontrolle. Zu viel Magie und der Lehrer versteht nicht mehr, was passiert. Zu viel Handarbeit und dein Produkt spart keine Zeit. Die Kunst liegt im schmalen Grat dazwischen.

Wenn ich mir dein Setup anschaue – Kurse → Themen → Lessons mit einem Notion-artigen Editor – dann hast du bereits das Fundament für etwas sehr Starkes. Eine Lesson-Page ist im Grunde ein flexibles Dokument: Text, Bilder, Links, Blöcke. Das ist exakt das, was Lehrer brauchen, um Inhalte zu erklären. In dieser Struktur ein PDF zu importieren und automatisch in Blöcke zu zerlegen ist nicht nur sinnvoll, es ist wahrscheinlich eines der wertvollsten Features deines Systems.

Der Grund ist simpel. PDFs sind in der Schule das dominante Format. Lehrer haben über Jahre Material angesammelt. Wenn dein System verlangt, dass sie alles neu schreiben, verlieren sie sofort das Interesse. Wenn dein System hingegen sagt: „Lade dein PDF hoch, wir machen daraus eine bearbeitbare Lesson“, dann nimmst du ihnen Arbeit ab. Das ist echtes Produktdenken.

Der Workflow könnte so aussehen. Die Lehrerin lädt ein PDF hoch. Dein Worker zerlegt das Dokument in Struktur: Überschrift, Absatz, Bild, Tabelle, Aufgabe. Diese Elemente werden dann automatisch in deine Lesson-Blöcke übersetzt. Ein Textblock wird zu einem Text-Block im Editor, ein Bild zu einem Image-Block, ein Diagramm zu einem Bild mit Annotation-Option. Das Ergebnis ist eine vollständig generierte Lesson-Page, die aussieht wie eine normale Notion-Seite – nur dass sie aus einem PDF entstanden ist. Danach kann die Lehrerin alles ändern, löschen, ergänzen oder Spiele hinzufügen.

Der entscheidende Punkt ist hier nicht die Konvertierung selbst, sondern die Reduzierung der Klicks. Menschen unterschätzen, wie stark ein Produkt davon abhängt. Jede zusätzliche Entscheidung kostet Energie. Ein gutes Tool fühlt sich so an, als würde es vorausdenken.

Darum würde ich dein System in zwei Ebenen strukturieren. Die erste Ebene ist der „Lesson Import“. Das ist der schnelle Weg. Ein PDF wird automatisch zu einer Lesson-Page konvertiert. Das ist der Moment, in dem der Lehrer merkt: Dieses Tool spart mir Zeit.

Die zweite Ebene ist der „Interactive Upgrade“. Hier beginnt der eigentliche Mehrwert deines Produkts. Aus den Lesson-Blöcken können interaktive Spiele entstehen. Ein Bildblock kann zu einem Image-Hotspot-Spiel werden. Ein Absatz kann zu einer Markierungsaufgabe werden. Eine Frage kann zu einem Multiple-Choice-Spiel werden. Der Lehrer entscheidet nur noch, ob er das möchte.

In dieser Struktur bleibt dein System verständlich. Erst kommt das Dokument, dann kommt die Interaktivität. Wenn du beides gleichzeitig erzwingst, wirkt es kompliziert.

Aus Produktsicht würde ich deshalb den Fokus stark auf Convenience legen. Automatisierung ist hier nicht Luxus, sondern Voraussetzung. Lehrer wollen nicht lernen, wie dein Tool funktioniert. Sie wollen ihr Material importieren und sofort weiterarbeiten.

Ein schönes mentales Modell dafür ist: Dein System verwandelt PDFs von „toten Dokumenten“ in „lebendige Lektionen“. Das PDF ist nur der Rohstoff. Die Lesson-Page ist das neue Medium.

Wenn man noch einen Schritt weiter denkt, wird daraus sogar eine ziemlich mächtige Vision. Dein Produkt wird nicht nur ein Serious-Game-Tool. Es wird eine Art „Content Engine für Unterricht“. PDFs, Texte und Bilder werden zu Lessons. Lessons werden zu interaktiven Spielen. Spiele erzeugen Lernstatistiken. Und daraus lernt der Lehrer wieder, wie er seinen Unterricht verbessert.

Das Spannende ist: Du bist mit deinem Notion-artigen Editor bereits genau auf dem richtigen Weg. Der Worksheet-Builder ist dann keine separate Funktion mehr, sondern einfach eine besonders intelligente Importfunktion für Lessons.

</aside>
