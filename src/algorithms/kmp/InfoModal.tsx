import { TextSearch, Repeat, MoveRight, Info } from 'lucide-react';
import InfoModal, { InfoSection, InfoCard, InfoCode, ComplexityChips } from '../../components/algorithm/InfoModal';
import { cn } from '../../components/ui';
import { toneText } from '../../components/ui/tone';
import { useLang, useTr } from '../../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartVisualization: () => void;
}

export default function KMPInfoModal({ isOpen, onClose, onStartVisualization }: Props) {
  const tr = useTr();
  const { lang } = useLang();
  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      onStartVisualization={onStartVisualization}
      icon={TextSearch}
      title={tr('KMP 알고리즘', 'The KMP algorithm')}
      subtitle={tr('Knuth-Morris-Pratt 문자열 검색', 'Knuth-Morris-Pratt string search')}
    >
      <InfoSection n={1} title={tr('문제 정의', 'The problem')}>
        {lang === 'ko' ? (
          <p>길이 n인 <strong>텍스트</strong> t 안에서 길이 m인 <strong>패턴</strong> p가 나타나는 <strong>모든 위치</strong>를 찾습니다. 단순 비교는 불일치마다 처음부터 다시 비교해서 최악 O(nm)이 걸려요.</p>
        ) : (
          <p>Find <strong>every position</strong> where a <strong>pattern</strong> p of length m occurs in a <strong>text</strong> t of length n. The naive approach restarts after each mismatch and takes O(nm) in the worst case.</p>
        )}
        <InfoCode caption={tr('예시', 'Example')}>
          {'t = ABABDABACDABABCABAB\np = ABABCABAB\n\n'}
          {tr('찾은 위치 (0부터): 10', 'Found at index: 10')}
        </InfoCode>
      </InfoSection>

      <InfoSection n={2} title={tr('핵심 아이디어', 'Key ideas')}>
        <div className="grid sm:grid-cols-2 gap-3">
          <InfoCard tone="current" icon={Repeat} title={tr('실패 함수 pi', 'Failure table pi')}>
            {tr(
              'pi[k]는 p[0..k]에서 접두사이면서 접미사인 가장 긴 문자열의 길이예요 (자기 자신 제외). 패턴을 자기 자신과 KMP로 비교해 O(m)에 만들어요.',
              'pi[k] is the length of the longest proper prefix of p[0..k] that is also its suffix. It is built in O(m) by running KMP on the pattern against itself.',
            )}
          </InfoCard>
          <InfoCard tone="visited" icon={MoveRight} title={tr('i는 뒤로 가지 않아요', 'i never moves back')}>
            {tr(
              'j글자가 맞은 뒤 불일치가 나면 j = pi[j-1]로 줄여 패턴만 오른쪽으로 밀어요. 이미 맞은 글자는 다시 비교하지 않아요.',
              'After j matched characters and a mismatch, set j = pi[j-1]: only the pattern slides right. Matched characters are never compared again.',
            )}
          </InfoCard>
        </div>
        <InfoCode caption={tr('p = ABABCABAB의 pi', 'pi for p = ABABCABAB')}>
          {'p  : A B A B C A B A B\npi : 0 0 1 2 0 1 2 3 4'}
        </InfoCode>
        <p className="text-muted-foreground text-[13px]">
          {tr(
            '패턴 끝까지 맞으면 위치를 기록하고 j = pi[m-1]로 줄여서 겹치는 다음 매칭도 찾아요.',
            'On a full match, record the position and set j = pi[m-1], so overlapping matches are found too.',
          )}
        </p>
      </InfoSection>

      <InfoSection n={3} title={tr('복잡도', 'Complexity')}>
        <ComplexityChips
          time="O(n + m)"
          space="O(m)"
          note={<>
            <Info className={cn('w-3.5 h-3.5 inline align-[-2px] mr-1', toneText.current)} aria-hidden />
            {tr(
              'j는 한 번에 1씩만 늘고 fallback마다 줄어서, 전체 비교 횟수는 2(n + m)을 넘지 않아요.',
              'j grows by at most 1 per character and every fallback shrinks it, so there are at most 2(n + m) comparisons.',
            )}
          </>}
        />
      </InfoSection>
    </InfoModal>
  );
}
