import { useState } from 'react';
import { useLang } from '../i18n';

export function GuideCard() {
  const [open, setOpen] = useState(true);
  const { t } = useLang();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-left text-sm text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
      >
        {t('guide.showGuide')}
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold">{t('guide.title')}</h3>
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          {t('guide.collapse')}
        </button>
      </div>

      <div className="space-y-3 text-sm text-[var(--text-secondary)]">
        <div className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">1</span>
          <div>
            <span className="text-[var(--text-primary)] font-medium">{t('guide.step1Title')}</span>
            <span className="ml-1">{t('guide.step1Desc')}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">2</span>
          <div>
            <span className="text-[var(--text-primary)] font-medium">{t('guide.step2Title')}</span>
            <span className="ml-1">{t('guide.step2Desc')}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">3</span>
          <div>
            <span className="text-[var(--text-primary)] font-medium">{t('guide.step3Title')}</span>
            <span className="ml-1">{t('guide.step3Desc')}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">4</span>
          <div>
            <span className="text-[var(--text-primary)] font-medium">{t('guide.step4Title')}</span>
            <span className="ml-1">{t('guide.step4Desc')}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs font-bold text-purple-400">5</span>
          <div>
            <span className="text-[var(--text-primary)] font-medium">{t('guide.step5Title')}</span>
            <span className="ml-1">{t('guide.step5Desc')}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-lg bg-[var(--bg-secondary)] p-2.5 text-xs text-[var(--text-secondary)]">
        {t('guide.disclaimer')}
      </div>

      <div className="mt-2 rounded-lg bg-[var(--bg-secondary)] p-2.5 text-xs text-[var(--text-secondary)]">
        {t('guide.testnet')}
      </div>
    </div>
  );
}
