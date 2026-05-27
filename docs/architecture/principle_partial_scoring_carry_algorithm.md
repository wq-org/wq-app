# Partial‑Scoring‑Carry‑Algorithm (PSCA)

> Bewertungsalgorithmus für Drag‑and‑Drop‑Math‑Aufgaben (WQ‑24).
> Vier‑Komponenten‑Score mit didaktischer Folgefehler‑Anerkennung.

---

## 1 — Zweck

Liefert pro Schülerantwort einen kontinuierlichen Score $\in [0, 1]$, der auf ein lehrerdefiniertes Punktemaximum $P_{\max}$ abgebildet werden kann. Die vier Subkomponenten sind didaktisch motiviert und entkoppeln _Endergebnis_, _Zwischenschritte_, _Methode_ und _formale Korrektheit_ voneinander.

---

## 2 — Hauptformel

$$
\text{Score} \;=\; w_r \cdot R \;+\; w_s \cdot S \;+\; w_m \cdot M \;+\; w_e \cdot E
$$

| Symbol | Name             | Bedeutung                                      | Wertebereich |
| ------ | ---------------- | ---------------------------------------------- | ------------ |
| $R$    | Result Score     | Endergebnis korrekt                            | $[0,1]$      |
| $S$    | Step Score       | Anteil korrekter Zwischenschritte              | $[0,1]$      |
| $M$    | Method Score     | Richtige Formel / Strategie gewählt            | $[0,1]$      |
| $E$    | Error‑Free Score | Einheit, Notation, Rundung, kein Konzeptfehler | $[0,1]$      |

**Constraint:** $w_r + w_s + w_m + w_e = 1$.

**Default‑Gewichte** (`DEFAULT_SCORING_WEIGHTS`):

```ts
const DEFAULT_SCORING_WEIGHTS = {
  result: 0.5, // w_r
  steps: 0.3, // w_s
  method: 0.15, // w_m
  errorFree: 0.05, // w_e
} as const
```

---

## 3 — Datenstruktur: Step‑Tree

Die Musterlösung ist ein gerichteter azyklischer Graph $T = (N, D)$. Jeder Knoten:

$$
n_i \;=\; \big(\text{op}_i,\ O_i,\ r_i,\ u_i,\ \text{dep}(n_i)\big)
$$

| Variable          | Bedeutung                                                | Beispiel (aus Lohnkosten‑Aufgabe)  |
| ----------------- | -------------------------------------------------------- | ---------------------------------- |
| $n_i$             | Knoten = ein Rechenschritt                               | $n_2$ = „Lohnkosten Auszubildende" |
| $\text{op}_i$     | erwarteter Operator $\in \{\times, +, -, \div, \Sigma\}$ | $\text{op}_2 = \times$             |
| $O_i$             | erwartete Operanden (Konstanten oder Refs)               | $O_2 = \{2,\ 12,\ 4{,}75\}$        |
| $r_i$             | erwartetes Resultat                                      | $r_2 = 114\,€$                     |
| $u_i$             | erwartete Einheit                                        | $u_2 = €$                          |
| $\text{dep}(n_i)$ | Vorgängerknoten (für Carry)                              | $\text{dep}(n_3) = \{n_1, n_2\}$   |

---

## 4 — M (Method Score) — Operator‑Match

$$
m_i \;=\; \begin{cases}
1   & \text{op}_i^{\text{s}} = \text{op}_i \\
0{,}5 & \text{op}_i^{\text{s}} \in \text{verwandt}(\text{op}_i) \\
0   & \text{sonst}
\end{cases}
\qquad
M \;=\; \frac{1}{|N|}\sum_{i=1}^{|N|} m_i
$$

| Variable                 | Bedeutung                                            | Beispiel                                |
| ------------------------ | ---------------------------------------------------- | --------------------------------------- |
| $\text{op}_i^{\text{s}}$ | vom Schüler gewählter Operator                       | Schüler nutzt `+` statt `×` → $m_2 = 0$ |
| $\text{verwandt}(\cdot)$ | erlaubte Nachbarn (z. B. $\Sigma \leftrightarrow +$) | `+` statt `Σ` → $m = 0{,}5$             |
| $M$                      | Mittelwert über alle Knoten                          | 4/5 Operatoren richtig → $M = 0{,}80$   |

> **Fehlende Steps:** Wenn ein erwarteter Knoten in der Schülerantwort fehlt, gilt $m_i = 0$.

---

## 5 — S (Step Score) mit Carry‑Resolver

### 5.1 Modus‑Schalter

$$
\text{mode} \in \{\text{carry},\ \text{strict}\}
$$

- **`carry`** (Default, didaktisch korrekt): erwartete Operanden werden durch _tatsächliche_ Schülerausgaben der Vorgänger ersetzt — Folgefehler werden anerkannt.
- **`strict`** (optional, Lehrer‑Override): erwartete Operanden bleiben die Musterlösungs‑Operanden $O_i$ — jeder Folgefehler wird als eigener Fehler gewertet.

### 5.2 Carry‑Resolver

$$
\tilde{O}_i^{\text{carry}} \;=\; \big\{\,r_j^{\text{s}} \;:\; j \in \text{dep}(n_i)\,\big\} \;\cup\; \text{Konstanten}(O_i)
$$

$$
\tilde{O}_i^{\text{strict}} \;=\; O_i
$$

$$
\tilde{r}_i^{\text{mode}} \;=\; \text{op}_i\big(\tilde{O}_i^{\text{mode}}\big)
$$

### 5.3 Step‑Bewertung

$$
s_i \;=\; \begin{cases}
1 & |r_i^{\text{s}} - \tilde{r}_i^{\text{mode}}| \le \varepsilon_i \\
0 & \text{sonst}
\end{cases}
\qquad
S \;=\; \frac{1}{|N|}\sum_{i=1}^{|N|} s_i
$$

| Variable                     | Bedeutung                                                       | Beispiel (carry)                                  |
| ---------------------------- | --------------------------------------------------------------- | ------------------------------------------------- |
| $r_j^{\text{s}}$             | tatsächliches Schülerergebnis von Vorgänger $j$                 | Schüler hat $n_2 = 100\,€$ statt 114              |
| $\tilde{r}_i^{\text{carry}}$ | erwartetes Ergebnis _gegeben_ Schülerinput                      | $\tilde{r}_3^{\text{carry}} = 111 + 100 = 211\,€$ |
| $s_i$                        | Step gilt als richtig, wenn nahe an $\tilde{r}_i^{\text{mode}}$ | Schüler schreibt 211 → $s_3 = 1$ ✓                |
| $\varepsilon_i$              | Toleranzfenster Knoten $i$ (siehe §7)                           | $\varepsilon_3 = 0{,}01\,€$                       |

---

## 6 — R (Result Score) — Endergebnis

$$
R \;=\; \begin{cases}
1 & |r_{\text{final}}^{\text{s}} - r_{\text{final}}| \le \varepsilon_{\text{final}} \\
\max\!\left(0,\ 1 - \dfrac{|r_{\text{final}}^{\text{s}} - r_{\text{final}}|}{|r_{\text{final}}|}\right) & \text{sonst (graceful)}
\end{cases}
$$

| Variable                      | Bedeutung           | Beispiel                        |
| ----------------------------- | ------------------- | ------------------------------- |
| $r_{\text{final}}$            | Soll‑Endergebnis    | $612\,€$                        |
| $r_{\text{final}}^{\text{s}}$ | Schüler‑Endergebnis | $573{,}92\,€$                   |
| $R$ (strict / binär)          | binäre Bewertung    | $R = 0$                         |
| $R$ (graceful)                | linearer Abfall     | $R = 1 - 38{,}08/612 = 0{,}938$ |

> **MVP‑Default:** binär. `graceful: true` ist eine optionale Lehrer‑Einstellung.

---

## 7 — Toleranzfenster $\varepsilon$

$$
\varepsilon_i \;=\; \max\!\big(\,\tau_{\text{abs}},\;\; \tau_{\text{rel}} \cdot |\tilde{r}_i^{\text{mode}}|\,\big)
$$

| Variable            | Bedeutung                                  | Default                                                  |
| ------------------- | ------------------------------------------ | -------------------------------------------------------- |
| $\tau_{\text{abs}}$ | absolute Toleranz (kleinste Recheneinheit) | $0{,}01\,€$                                              |
| $\tau_{\text{rel}}$ | relative Toleranz (Rundungsdrift)          | $0{,}001$ (0,1 %)                                        |
| $\varepsilon_i$     | effektive Toleranz pro Knoten              | bei $r = 387\,€$ → $\max(0{,}01;\ 0{,}387) = 0{,}387\,€$ |

> Damit zählen `387,00 €`, `387 €` und `386,99 €` als korrekt; `380 €` nicht.

---

## 8 — E (Error‑Free Score) — Einheit / Notation / Konzept

Pro Knoten drei unabhängige Subchecks:

$$
e_i \;=\; \frac{e_i^{\text{unit}} + e_i^{\text{notation}} + e_i^{\text{concept}}}{3}
\qquad
E \;=\; \frac{1}{|N|}\sum_{i=1}^{|N|} e_i
$$

| Variable                | Bedeutung                                                   | Beispiel                           |
| ----------------------- | ----------------------------------------------------------- | ---------------------------------- |
| $e_i^{\text{unit}}$     | Einheit korrekt vorhanden & passend                         | `612` (ohne €) → $0$               |
| $e_i^{\text{notation}}$ | Dezimaltrennzeichen, Tausenderpunkt, Rundung                | `4.75` statt `4,75` (DE) → $0{,}5$ |
| $e_i^{\text{concept}}$  | kein grober Konzeptfehler (z. B. Vorzeichen, Operandtausch) | reine Vorzeichenfehler etc. → $0$  |
| $E$                     | Mittel über alle Knoten                                     | siehe §10 Worked Example           |

---

## 9 — Punktemapping auf Lehrerskala

Bei lehrerdefiniertem Punktemaximum $P_{\max}$ (z. B. `gameDragDropMathDefaultConfig.points = 10`):

$$
P \;=\; \text{Score} \cdot P_{\max}
$$

Optional pro Knoten:

$$
P_i \;=\; \big(w_r \cdot r_i^{\text{eval}} + w_s \cdot s_i + w_m \cdot m_i + w_e \cdot e_i\big) \cdot P_{\max,\,i}
$$

---

## 10 — Worked Example: _Lohnkosten Auszubildende falsch_

**Aufgabe:** Fertigungslohnkosten incl. laGMK = 612 €
**Schülerfehler:** $n_2: 2 \times 12 \times 4{,}75 = 100\,€$ (statt 114). Rest sauber durchgezogen mit Carry.

| Knoten                | Schüler   | Carry‑Soll              | $m_i$ | $s_i$ | $e_i$ |
| --------------------- | --------- | ----------------------- | ----- | ----- | ----- |
| $n_1$ (6 × 18,5)      | 111 €     | 111 €                   | 1     | 1     | 1,00  |
| $n_2$ (2 × 12 × 4,75) | **100 €** | 114 €                   | 1     | **0** | 0,67  |
| $n_3$ (Σ Basis)       | 211 €     | 111 + 100 = 211 €       | 1     | 1     | 1,00  |
| $n_4$ (× 1,72)        | 362,92 €  | 211 × 1,72 = 362,92 €   | 1     | 1     | 1,00  |
| $n_5$ (Σ End)         | 573,92 €  | 211 + 362,92 = 573,92 € | 1     | 1     | 1,00  |

$$
M = 5/5 = 1{,}00 \qquad S = 4/5 = 0{,}80 \qquad E = 4{,}67/5 = 0{,}93
$$

$$
R = 0 \quad (\text{Endergebnis} \neq 612\,€)
$$

$$
\text{Score} \;=\; 0{,}50 \cdot 0 + 0{,}30 \cdot 0{,}80 + 0{,}15 \cdot 1{,}00 + 0{,}05 \cdot 0{,}93
$$

$$
\boxed{\text{Score} \;=\; 0{,}24 + 0{,}15 + 0{,}047 \;=\; 0{,}437 \;\approx\; \mathbf{43{,}7\,\%}}
$$

Bei $P_{\max} = 10$: **4,37 Punkte**.

---

## 11 — TypeScript‑Vertrag

```ts
type StepOperator = '×' | '+' | '−' | '÷' | 'Σ'
type ScoringMode = 'carry' | 'strict'

type StepRef = { ref: string }
type StepOperand = number | StepRef

type StepNode = {
  id: string
  operator: StepOperator
  operands: StepOperand[]
  expected: number
  unit: string
  deps: string[]
}

type StudentStep = {
  nodeId: string
  operator: StepOperator
  operands: StepOperand[]
  actual: number
  unit: string
  notation: { decimal: 'comma' | 'dot'; rounded: boolean }
}

type ScoringConfig = {
  weights: { r: number; s: number; m: number; e: number }
  mode: ScoringMode
  tolerance: { abs: number; rel: number }
  graceful: boolean
}

type StepBreakdown = {
  nodeId: string
  m: 0 | 0.5 | 1
  s: 0 | 1
  e: number
  carrySoll: number
}

type PscaResult = {
  score: number
  R: number
  S: number
  M: number
  E: number
  perStep: StepBreakdown[]
  awardedPoints: number
}

declare function pscaScore(
  tree: StepNode[],
  studentAnswers: Record<string, StudentStep>,
  config: ScoringConfig,
  pointsMax: number,
): PscaResult
```

---

## 12 — Eckpfeiler

1. **Pure Funktion** — kein React, kein DOM, keine Supabase‑Calls. Lebt unter `utils/scoring/`.
2. **Deterministisch** — gleiche Eingabe ⇒ gleicher Score.
3. **Modus‑umschaltbar** — `carry` (Default) ↔ `strict` per Config.
4. **Toleranzbasiert** — Rundung kollabiert nicht den Score.
5. **Aufgliederbar** — `perStep` macht das Ergebnis im UI erklärbar.

---

_WQ Motion Aware Learning · Game Studio · Drag‑and‑Drop‑Math · WQ‑24_
