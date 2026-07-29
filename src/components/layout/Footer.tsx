import { Link } from 'react-router-dom';
import { Logo } from '@/components/brand/Logo';
import { useLanguage, languages } from '@/i18n/LanguageProvider';
import { solutions } from '@/data/solutions';

export function Footer() {
  const { t, lang, setLang } = useLanguage();

  return (
    <footer className="border-t border-border bg-card/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground max-w-xs">{t('footer.tagline')}</p>
            <div className="flex gap-2">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    lang === l.code
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="text-sm leading-none">{l.flag}</span>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">{t('footer.product')}</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {solutions.map((s) => (
                <li key={s.slug}>
                  <Link to={`/solutions/${s.slug}`} className="hover:text-foreground transition-colors">
                    {t(s.titleKey)}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/pricing" className="hover:text-foreground transition-colors">
                  {t('nav.pricing')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">{t('footer.company')}</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition-colors">{t('footer.about')}</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">{t('nav.contact')}</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">{t('footer.careers')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">{t('footer.resources')}</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/docs" className="hover:text-foreground transition-colors">{t('nav.docs')}</Link></li>
              <li><Link to="/docs" className="hover:text-foreground transition-colors">{t('footer.status')}</Link></li>
              <li><Link to="/docs" className="hover:text-foreground transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link to="/docs" className="hover:text-foreground transition-colors">{t('footer.terms')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} SalesDaddy. {t('footer.rights')}</p>
          <p className="flex items-center gap-2">🇧🇩 Dhaka, Bangladesh · 🇬🇧 English & বাংলা</p>
        </div>
      </div>
    </footer>
  );
}
