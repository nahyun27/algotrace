import { ExternalLink } from 'lucide-react';
import { cn } from '../ui';
import { useTr } from '../../i18n';

export interface Problem {
  /** Baekjoon problem number */
  id: number;
  title: string;
  tier: string;
  nLimit: string;
  note: string;
}

const tierClass = (tier: string) =>
  tier.startsWith('Bronze')   ? 'bg-[#ad5600]/12 text-[#ad5600] dark:text-[#e08a3c]' :
  tier.startsWith('Silver')   ? 'bg-[#435f7a]/12 text-[#435f7a] dark:text-[#9fb6cc]' :
  tier.startsWith('Gold')     ? 'bg-[#ec9a00]/15 text-[#a96d00] dark:text-[#ffc94d]' :
  tier.startsWith('Platinum') ? 'bg-[#27e2a4]/15 text-[#0f8a63] dark:text-[#5ff0c0]' :
                                'bg-muted text-muted-foreground';

/** Related Baekjoon (BOJ) problems for the current algorithm. */
export default function ProblemList({ problems }: { problems: Problem[] }) {
  const tr = useTr();
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground px-1">
        {tr('백준(BOJ)에서 바로 풀어볼 수 있는 연습 문제예요.', 'Practice problems on Baekjoon Online Judge (BOJ).')}
      </p>
      <ul className="flex flex-col gap-2">
        {problems.map(prob => (
          <li key={prob.id}>
            <a
              href={`https://www.acmicpc.net/problem/${prob.id}`}
              target="_blank"
              rel="noreferrer"
              className="group block rounded-2xl border border-border bg-card p-3.5 transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-mono text-[11px] font-semibold text-muted-foreground">#{prob.id}</span>
                  <p className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">{prob.title}</p>
                </div>
                <ExternalLink className="w-4 h-4 shrink-0 mt-1 text-hint group-hover:text-primary transition-colors" />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className={cn('text-[11px] px-2 py-0.5 rounded-md font-bold', tierClass(prob.tier))}>{prob.tier}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-primary-soft text-primary font-mono">{prob.nLimit}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-muted text-muted-foreground">{prob.note}</span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
