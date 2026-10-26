import type { KMPStep } from './types';
import { makeTr, type Lang } from '../../i18n';

/** Shows a character in descriptions (spaces become a visible symbol). */
const ch = (c: string) => (c === ' ' ? '␣' : c);

type StepInput = Omit<KMPStep, 'pi' | 'found' | 'piCell' | 'piRead' | 'hit'> & Partial<Pick<KMPStep, 'piCell' | 'piRead' | 'hit'>>;

/**
 * KMP string search in two phases: build the failure table `pi` by matching the pattern against itself,
 * then scan the text. `pi[k]` = length of the longest proper prefix of p[0..k] that is also its suffix.
 */
export function generateKMPSteps(text: string, pattern: string, lang: Lang = 'ko'): KMPStep[] {
  const tr = makeTr(lang);
  const t = text, p = pattern;
  const n = t.length, m = p.length;
  const steps: KMPStep[] = [];
  const pi: (number | null)[] = Array(m).fill(null);
  if (m > 0) pi[0] = 0;
  const found: number[] = [];

  const push = (s: StepInput) => {
    steps.push({ piCell: null, piRead: null, hit: null, ...s, pi: [...pi], found: [...found] });
  };

  push({
    type: 'INIT', phase: 'pi', i: 1, shift: 1, matched: 0, cmp: null, piCell: m > 0 ? 0 : null,
    description: tr(
      `1단계: 실패 함수 pi를 만들어요. 패턴 "${p}"를 자기 자신과 비교해요. pi[0] = 0, j = 0에서 시작해요.`,
      `Phase 1: build the failure table pi by matching the pattern "${p}" against itself. pi[0] = 0 and j starts at 0.`,
    ),
    codeLine: 1,
  });

  // Phase 1: failure table
  let j = 0;
  for (let i = 1; i < m; i++) {
    while (j > 0 && p[i] !== p[j]) {
      const nj = pi[j - 1]!;
      push({
        type: 'PI_FALLBACK', phase: 'pi', i, shift: i - j, matched: j, cmp: { j, ok: false }, piRead: j - 1,
        description: tr(
          `p[${i}]='${ch(p[i])}' ≠ p[${j}]='${ch(p[j])}'. j = pi[${j - 1}] = ${nj}로 돌아가 더 짧은 접두사로 다시 비교해요.`,
          `p[${i}]='${ch(p[i])}' ≠ p[${j}]='${ch(p[j])}'. Fall back to j = pi[${j - 1}] = ${nj} and retry with a shorter prefix.`,
        ),
        codeLine: 2,
      });
      j = nj;
    }
    if (p[i] === p[j]) {
      push({
        type: 'PI_MATCH', phase: 'pi', i, shift: i - j, matched: j, cmp: { j, ok: true },
        description: tr(
          `p[${i}]='${ch(p[i])}' = p[${j}]='${ch(p[j])}'. 일치하므로 j를 ${j + 1}로 늘려요.`,
          `p[${i}]='${ch(p[i])}' = p[${j}]='${ch(p[j])}'. They match, so j grows to ${j + 1}.`,
        ),
        codeLine: 3,
      });
      j++;
    }
    pi[i] = j;
    push({
      type: 'PI_SET', phase: 'pi', i, shift: i - j + 1, matched: j, cmp: null, piCell: i,
      description: j > 0
        ? tr(
          `pi[${i}] = ${j}: p[0..${i}]의 접두사 "${p.slice(0, j)}"가 접미사와 같아요.`,
          `pi[${i}] = ${j}: the prefix "${p.slice(0, j)}" of p[0..${i}] is also its suffix.`,
        )
        : tr(
          `p[${i}]='${ch(p[i])}' ≠ p[0]='${ch(p[0])}'. 겹치는 접두사가 없으니 pi[${i}] = 0이에요.`,
          `p[${i}]='${ch(p[i])}' ≠ p[0]='${ch(p[0])}'. No prefix overlaps, so pi[${i}] = 0.`,
        ),
      codeLine: 4,
    });
  }

  // Phase 2: search
  push({
    type: 'INIT', phase: 'search', i: 0, shift: 0, matched: 0, cmp: null,
    description: tr(
      `2단계: pi = [${pi.join(', ')}]. 이제 텍스트를 i = 0부터 읽으며 패턴과 비교해요.`,
      `Phase 2: pi = [${pi.join(', ')}]. Now scan the text from i = 0, comparing against the pattern.`,
    ),
    codeLine: 5,
  });

  j = 0;
  for (let i = 0; i < n && m > 0; i++) {
    while (j > 0 && t[i] !== p[j]) {
      push({
        type: 'SEARCH_MISMATCH', phase: 'search', i, shift: i - j, matched: j, cmp: { j, ok: false },
        description: tr(
          `t[${i}]='${ch(t[i])}' ≠ p[${j}]='${ch(p[j])}'. 불일치! 지금까지 맞은 ${j}글자를 버리지 않고 pi를 이용해요.`,
          `t[${i}]='${ch(t[i])}' ≠ p[${j}]='${ch(p[j])}'. Mismatch! Instead of discarding the ${j} matched characters, use pi.`,
        ),
        codeLine: 6,
      });
      const nj = pi[j - 1]!;
      push({
        type: 'SEARCH_FALLBACK', phase: 'search', i, shift: i - nj, matched: nj, cmp: null, piRead: j - 1,
        description: tr(
          `j = pi[${j - 1}] = ${nj}. 패턴을 ${j - nj}칸 오른쪽으로 밀고, i는 그대로 둔 채 다시 비교해요.`,
          `j = pi[${j - 1}] = ${nj}. Slide the pattern ${j - nj} to the right and compare again without moving i.`,
        ),
        codeLine: 7,
      });
      j = nj;
    }
    if (t[i] === p[j]) {
      push({
        type: 'SEARCH_MATCH', phase: 'search', i, shift: i - j, matched: j, cmp: { j, ok: true },
        description: tr(
          `t[${i}]='${ch(t[i])}' = p[${j}]='${ch(p[j])}'. 일치하므로 j = ${j + 1}.`,
          `t[${i}]='${ch(t[i])}' = p[${j}]='${ch(p[j])}'. Match, so j = ${j + 1}.`,
        ),
        codeLine: 8,
      });
      j++;
      if (j === m) {
        const start = i - m + 1;
        found.push(start);
        const nj = pi[j - 1]!;
        push({
          type: 'FOUND', phase: 'search', i, shift: start, matched: m, cmp: null, piRead: m - 1, hit: start,
          description: tr(
            `패턴 전체가 일치해요! 인덱스 ${start} (1부터 세면 ${start + 1})에서 찾았어요. 다음 매칭을 위해 j = pi[${m - 1}] = ${nj}.`,
            `The whole pattern matches! Found at index ${start} (position ${start + 1} counting from 1). For the next match, j = pi[${m - 1}] = ${nj}.`,
          ),
          codeLine: 9,
        });
        j = nj;
      }
    } else {
      push({
        type: 'SEARCH_MISMATCH', phase: 'search', i, shift: i, matched: 0, cmp: { j: 0, ok: false },
        description: tr(
          `t[${i}]='${ch(t[i])}' ≠ p[0]='${ch(p[0])}'. 맞은 글자가 없으니 i만 다음 칸으로 넘어가요.`,
          `t[${i}]='${ch(t[i])}' ≠ p[0]='${ch(p[0])}'. Nothing is matched yet, so just move i to the next character.`,
        ),
        codeLine: 11,
      });
    }
  }

  push({
    type: 'DONE', phase: 'search', i: n, shift: Math.max(0, n - m), matched: 0, cmp: null,
    description: found.length > 0
      ? tr(
        `[완료] ${found.length}번 찾았어요. 시작 위치 (1부터): ${found.map(x => x + 1).join(', ')}. 텍스트를 한 번만 훑었어요.`,
        `[Done] Found ${found.length} match${found.length > 1 ? 'es' : ''}. Start positions (from 1): ${found.map(x => x + 1).join(', ')}. The text was scanned only once.`,
      )
      : tr('[완료] 패턴이 텍스트에 없어요.', '[Done] The pattern does not occur in the text.'),
    codeLine: 10,
  });

  return steps;
}
