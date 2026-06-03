import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '../contexts/SnackbarContext';
import {
  ChevronLeft,
  ChevronDown,
  Image as ImageIcon,
  Link as LinkIcon,
  Lock,
  X,
  Upload,
} from 'lucide-react';
import Stepper from '../components/ui/Stepper';
import Button from '../components/ui/Button';
import ImageCropModal from '../components/ui/ImageCropModal';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import { useBuilderContent } from './websites/builder/useBuilderContent';
import { useBuilderFeatures } from './websites/builder/useBuilderFeatures';
import { useBuilderPublish } from './websites/builder/useBuilderPublish';
import FeaturesStep from './websites/builder/steps/FeaturesStep';
import ConfigureStep from './websites/builder/steps/ConfigureStep';
import StylingStep from './websites/builder/steps/StylingStep';
import PublishStep from './websites/builder/steps/PublishStep';
import BusinessPanel from './websites/builder/panels/BusinessPanel';
import ShopPanel from './websites/builder/panels/ShopPanel';
import ContactPanel from './websites/builder/panels/ContactPanel';
import QuotePanel from './websites/builder/panels/QuotePanel';
import AppointmentPanel from './websites/builder/panels/AppointmentPanel';
import LocationPanel from './websites/builder/panels/LocationPanel';
import ReviewsPanel from './websites/builder/panels/ReviewsPanel';
import CustomPagePanel from './websites/builder/panels/CustomPagePanel';
import HouzezPreview from './websites/templates/houzez/HouzezPreview';

const LANGUAGE_OPTIONS = [
  { id: 'id', labelKey: 'auth:onboarding.basic.languages.indonesian' },
  { id: 'en', labelKey: 'auth:onboarding.basic.languages.english' },
  { id: 'both', labelKey: 'auth:onboarding.basic.languages.both' },
];

const PLATFORM_OPTIONS = [
  {
    id: 'labamu-app',
    labelKey: 'auth:onboarding.basic.labamuApp',
    helperKey: 'auth:onboarding.basic.labamuAppDescription',
    disabled: false,
  },
  {
    id: 'mrp',
    labelKey: 'auth:onboarding.basic.mrp',
    helperKey: 'auth:onboarding.basic.mrpDescription',
    disabled: true,
  },
];

const TEMPLATE_OPTIONS = [
  {
    id: 'xinear',
    preview: '/assets/templates/xinear/xinear.png',
    titleKey: 'website:gallery.templates.xinear.title',
    descKey: 'website:gallery.templates.xinear.desc',
    recommended: true,
  },
  {
    id: 'houzez',
    preview: '/assets/templates/houzez/assets/houzez.png',
    titleKey: 'website:gallery.templates.houzez.title',
    descKey: 'website:gallery.templates.houzez.desc',
  },
  {
    id: 'barger',
    preview: '/assets/templates/barger/barger.png',
    titleKey: 'website:gallery.templates.barger.title',
    descKey: 'website:gallery.templates.barger.desc',
  },
  {
    id: 'napoli',
    preview: '/assets/templates/napoli/napoli.png',
    titleKey: 'website:gallery.templates.napoli.title',
    descKey: 'website:gallery.templates.napoli.desc',
  },
  {
    id: 'dekor',
    preview: '/assets/templates/dekor/dekor.png',
    titleKey: 'website:gallery.templates.dekor.title',
    descKey: 'website:gallery.templates.dekor.desc',
  },
  {
    id: 'medic',
    preview: '/assets/templates/medic/medic.png',
    titleKey: 'website:gallery.templates.medic.title',
    descKey: 'website:gallery.templates.medic.desc',
  },
  {
    id: 'photostoodio',
    preview: '/assets/templates/photostoodio/photostoodio.png',
    titleKey: 'website:gallery.templates.photostoodio.title',
    descKey: 'website:gallery.templates.photostoodio.desc',
  },
  {
    id: 'local',
    preview: '/assets/templates/local/local.png',
    titleKey: 'website:gallery.templates.local.title',
    descKey: 'website:gallery.templates.local.desc',
  },
];

function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start' }}>
      <div style={{ minWidth: 0 }}>
        <h2 style={{ margin: 0, fontSize: '20px', lineHeight: '28px', fontWeight: 800, color: 'var(--neutral-on-surface-primary)' }}>
          {title}
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: '14px', lineHeight: '22px', color: 'var(--neutral-on-surface-secondary)' }}>
          {subtitle}
        </p>
      </div>
      {action}
    </div>
  );
}

function LogoUploadBox({ logoPreview, inputRef, onSelectLogo, onLogoFileSelect, onClearLogo, t }) {
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpg,image/jpeg"
        style={{ display: 'none' }}
        onChange={onLogoFileSelect}
      />

      <div
        onClick={onSelectLogo}
        style={{
          width: '100%',
          minHeight: '278px',
          borderRadius: '16px',
          border: '2px dashed var(--feature-brand-primary)',
          background: 'var(--neutral-surface-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          boxSizing: 'border-box',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {!logoPreview ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
            <div style={{ color: 'var(--neutral-on-surface-secondary)' }}>
              <Upload size={28} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '16px', lineHeight: '24px', color: 'var(--neutral-on-surface-secondary)' }}>
                {t('auth:onboarding.basic.logoHelper')}
              </div>
              <div style={{ fontSize: '14px', lineHeight: '20px', color: 'var(--neutral-on-surface-secondary)' }}>
                {t('auth:onboarding.basic.logoFormats')}
              </div>
            </div>
            <div
              style={{
                padding: '0 18px',
                height: '44px',
                borderRadius: '12px',
                border: '1px solid var(--feature-brand-primary)',
                color: 'var(--feature-brand-primary)',
                fontSize: '16px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--neutral-surface-primary)',
              }}
            >
              {t('auth:onboarding.basic.logoButton')}
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <img
              src={logoPreview}
              alt={t('auth:onboarding.basic.businessLogo')}
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onSelectLogo();
              }}
              style={{
                position: 'absolute',
                right: '16px',
                bottom: '16px',
                padding: '0 16px',
                height: '36px',
                borderRadius: '10px',
                border: '1px solid var(--feature-brand-primary)',
                background: 'var(--neutral-surface-primary)',
                color: 'var(--feature-brand-primary)',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Change Image
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onClearLogo();
              }}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: '1px solid var(--status-red-primary)',
                background: 'var(--neutral-surface-primary)',
                color: 'var(--status-red-primary)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PlatformCard({ option, selectedPlatform, t }) {
  const selected = selectedPlatform === option.id;

  return (
    <button
      type="button"
      disabled={option.disabled}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '16px 18px',
        borderRadius: '16px',
        border: selected ? '1px solid var(--feature-brand-primary)' : '1px solid var(--neutral-line-separator-1)',
        background: selected ? 'var(--feature-brand-container-lighter)' : option.disabled ? 'var(--neutral-surface-grey-lighter)' : 'var(--neutral-surface-primary)',
        color: option.disabled ? 'var(--neutral-on-surface-tertiary)' : 'var(--neutral-on-surface-primary)',
        textAlign: 'left',
        cursor: option.disabled ? 'not-allowed' : 'pointer',
        opacity: option.disabled ? 0.88 : 1,
      }}
    >
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          border: selected ? '2px solid var(--feature-brand-primary)' : '1px solid var(--neutral-line-separator-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: 'var(--neutral-surface-primary)',
        }}
      >
        {selected && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--feature-brand-primary)' }} />}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 700 }}>{t(option.labelKey)}</div>
          {option.disabled && (
            <Lock size={14} color="currentColor" style={{ flexShrink: 0 }} />
          )}
        </div>
        <div style={{ marginTop: '4px', fontSize: '13px', lineHeight: '20px', color: 'var(--neutral-on-surface-secondary)' }}>
          {t(option.helperKey)}
        </div>
      </div>
    </button>
  );
}

function TemplateCard({ template, selected, onSelect, t }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <button
        type="button"
        onClick={() => onSelect(template.id)}
        style={{
          position: 'relative',
          width: '100%',
          padding: 0,
          borderRadius: '18px',
          overflow: 'hidden',
          border: selected ? '2px solid var(--feature-brand-primary)' : '1px solid var(--neutral-line-separator-1)',
          background: 'var(--neutral-surface-primary)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: selected ? '0 12px 24px rgba(0, 107, 255, 0.12)' : 'none',
        }}
      >
        <img
          src={template.preview}
          alt={t(template.titleKey)}
          style={{
            width: '100%',
            aspectRatio: '4 / 3',
            objectFit: 'cover',
            objectPosition: 'top center',
            display: 'block',
          }}
        />

        {template.recommended && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              padding: '6px 10px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.95)',
              color: 'var(--status-green-on-container)',
              fontSize: '12px',
              fontWeight: 700,
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
            }}
          >
            {t('auth:onboarding.template.recommended')}
          </div>
        )}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          aria-hidden="true"
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: selected ? '2px solid var(--feature-brand-primary)' : '1px solid var(--neutral-line-separator-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            background: 'var(--neutral-surface-primary)',
          }}
        >
          {selected && (
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--feature-brand-primary)' }} />
          )}
        </div>
        <div>
          <div style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 700, color: 'var(--neutral-on-surface-primary)' }}>
            {t(template.titleKey)}
          </div>
          <div style={{ marginTop: '4px', fontSize: '13px', lineHeight: '20px', color: 'var(--neutral-on-surface-secondary)' }}>
            {t(template.descKey)}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmationModal({ open, onClose, title, description, confirmLabel, cancelLabel }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.45)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        boxSizing: 'border-box',
      }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: 'min(329px, 100%)',
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.16)',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: '0px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              color: '#A9A9A9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px',
            }}
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'center', width: '100%' }}>
            <p style={{
              margin: 0,
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: '18px',
              lineHeight: '26px',
              letterSpacing: '0.124px',
              color: '#282828',
            }}>
              {title}
            </p>
            <p style={{
              margin: 0,
              fontFamily: "'Lato', sans-serif",
              fontWeight: 700,
              fontSize: '12px',
              lineHeight: '18px',
              letterSpacing: '0.083px',
              color: '#7E7E7E',
            }}>
              {description}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <button
              type="button"
              onClick={confirmLabel.onClick}
              style={{
                width: '100%',
                height: '51px',
                background: '#006BFF',
                border: 'none',
                borderRadius: '12px',
                fontFamily: "'Lato', sans-serif",
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: '22px',
                letterSpacing: '0.11px',
                color: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              {confirmLabel.text}
            </button>
            <button
              type="button"
              onClick={cancelLabel.onClick}
              style={{
                width: '100%',
                height: '51px',
                background: '#FFFFFF',
                border: '1px solid #005DE0',
                borderRadius: '12px',
                fontFamily: "'Lato', sans-serif",
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: '22px',
                letterSpacing: '0.11px',
                color: '#005DE0',
                cursor: 'pointer',
              }}
            >
              {cancelLabel.text}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SyncPlatformConfirmModal({ open, onClose, onConfirm, selectedPlatform, t }) {
  const platformLabel = selectedPlatform === 'mrp' ? t('auth:onboarding.basic.mrp') : t('auth:onboarding.basic.labamuApp');

  return (
    <ConfirmationModal
      open={open}
      onClose={onClose}
      title="Confirm Sync Platform?"
      description={`You're about to set ${platformLabel} as your sync platform. This choice is permanent and cannot be changed after onboarding.`}
      confirmLabel={{ text: 'Yes, Continue', onClick: onConfirm }}
      cancelLabel={{ text: 'Cancel', onClick: onClose }}
    />
  );
}

function SkipWebsiteSetupModal({ open, onClose, onConfirm, t }) {
  return (
    <ConfirmationModal
      open={open}
      onClose={onClose}
      title={t('auth:onboarding.skip.title')}
      description={t('auth:onboarding.skip.description')}
      confirmLabel={{ text: t('auth:onboarding.skip.confirm'), onClick: onConfirm }}
      cancelLabel={{ text: t('auth:onboarding.skip.cancel'), onClick: onClose }}
    />
  );
}

export default function LabamuOnboarding() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { t: websiteT } = useTranslation('website');
  const { showSnackbar } = useSnackbar();

  const content = useBuilderContent();
  const publish = useBuilderPublish();
  const features = useBuilderFeatures({
    onCustomPageAdd: content.handleCustomPageAdd,
    onCustomPageRemove: content.handleCustomPageRemove,
    onCustomPageRename: content.handleCustomPageRename,
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('xinear');
  const firstTimeSource = sessionStorage.getItem('lb_first_time_source');
  const fromMRP = firstTimeSource === 'mrp';
  const fromBoth = firstTimeSource === 'both';
  const [selectedPlatform, setSelectedPlatform] = useState(fromMRP ? 'mrp' : 'labamu-app');
  const [syncPlatformConfirmOpen, setSyncPlatformConfirmOpen] = useState(false);
  const [pendingFinishAction, setPendingFinishAction] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewport, setViewport] = useState('desktop');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [skipModalOpen, setSkipModalOpen] = useState(false);
  const [activeConfigPanel, setActiveConfigPanel] = useState('business');
  const [websiteLanguage, setWebsiteLanguage] = useState(() => {
    const codes = content.languages?.map((lang) => lang.code) ?? [];
    if (codes.includes('id') && codes.includes('en')) return 'both';
    return codes[0] === 'id' ? 'id' : 'en';
  });

  const langMenuRef = useRef(null);

  const steps = [
    t('auth:onboarding.steps.basicInformation'),
    t('auth:onboarding.steps.styling'),
    t('auth:onboarding.steps.features'),
    t('auth:onboarding.steps.configure'),
    t('auth:onboarding.steps.publish'),
  ];

  const deferredFeatureOrder = useDeferredValue(features.featureOrder);
  const deferredSelectedFeatures = useDeferredValue(features.selectedFeatures);

  const configItems = useMemo(() => {
    const items = [
      {
        id: 'business',
        title: websiteT('studio.configure.panels.business'),
        desc: websiteT('studio.configure.panels.businessDesc'),
        icon: ImageIcon,
      },
    ];

    features.featureOrder.forEach((id) => {
      if (!features.selectedFeatures.has(id)) return;

      const found = features.AVAILABLE_FEATURES.find((feature) => feature.id === id);
      if (found) {
        items.push({
          id: found.id,
          title: websiteT(`studio.configure.panels.${found.id}`),
          desc: websiteT(`studio.configure.panels.${found.id}Desc`),
          icon: found.icon,
        });
        return;
      }

      items.push({
        id,
        title: content.currentConfig.customPages?.[id] || websiteT('studio.features.pageName'),
        desc: 'Custom page content',
        icon: LinkIcon,
        isCustom: true,
      });
    });

    return items;
  }, [
    content.currentConfig.customPages,
    features.AVAILABLE_FEATURES,
    features.featureOrder,
    features.selectedFeatures,
    websiteT,
  ]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setLangMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const currentLocale = i18n.language === 'id' ? 'id' : 'en';
  const canContinueStepOne = content.sharedConfig.businessName.trim().length > 0 && Boolean(content.sharedConfig.headerLogo);
  const canContinueStepTwo = true;
  const resolvedConfigPanelId = activeConfigPanel && configItems.some((item) => item.id === activeConfigPanel)
    ? activeConfigPanel
    : null;
  const selectedConfigPanelTitle = resolvedConfigPanelId
    ? configItems.find((item) => item.id === resolvedConfigPanelId)?.title || ''
    : '';

  const syncWebsiteLanguageSelection = (value) => {
    setWebsiteLanguage(value);

    const target = value === 'id' ? 'id' : 'en';
    const currentCodes = content.languages.map((lang) => lang.code);

    if (value === 'both') {
      if (!currentCodes.includes('id')) content.handleAddLanguage('id');
      if (!currentCodes.includes('en')) content.handleAddLanguage('en');
      content.setActiveLang(currentLocale);
      return;
    }

    if (!currentCodes.includes(target)) {
      content.handleAddLanguage(target);
    }

    currentCodes
      .filter((code) => code !== target)
      .forEach((code) => content.handleRemoveLanguage(code));

    content.setActiveLang(target);
  };

  const finishOnboarding = (action = 'publish') => {
    sessionStorage.setItem('lb_mock_auth', 'true');
    sessionStorage.removeItem('lb_show_mismatch_banner');
    const message = action === 'skip'
      ? t('auth:onboarding.snackbar.skipped')
      : t('auth:onboarding.snackbar.published');
    showSnackbar(message, 'green');
    navigate('/dashboard', { replace: true });
  };

  const handleContinue = () => {
    if (currentStep === 0 && !canContinueStepOne) return;
    if (currentStep === 1 && !canContinueStepTwo) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    if (fromBoth) {
      setPendingFinishAction('publish');
      setSyncPlatformConfirmOpen(true);
      return;
    }

    finishOnboarding('publish');
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('lb_lang', lng);
    setLangMenuOpen(false);
  };

  const handleSkipWebsiteSetup = () => {
    if (fromBoth) {
      setPendingFinishAction('skip');
      setSyncPlatformConfirmOpen(true);
      return;
    }
    setSkipModalOpen(true);
  };

  const handleConfirmSkipWebsiteSetup = () => {
    setSkipModalOpen(false);
    finishOnboarding('skip');
  };

  const handleConfirmSyncPlatform = () => {
    setSyncPlatformConfirmOpen(false);
    const action = pendingFinishAction;
    setPendingFinishAction(null);
    if (action === 'skip') {
      setSkipModalOpen(true);
    } else {
      finishOnboarding('publish');
    }
  };

  const handleCloseSyncPlatformConfirm = () => {
    setSyncPlatformConfirmOpen(false);
    setPendingFinishAction(null);
  };

  const renderConfigPanelContent = () => {
    if (!resolvedConfigPanelId) return null;

    switch (resolvedConfigPanelId) {
      case 'business':
        return (
          <BusinessPanel
            logoInputRef={content.logoFileInputRef}
            bannerInputRef={content.bannerFileInputRef}
            headerLogo={content.sharedConfig.headerLogo}
            banners={content.sharedConfig.banners}
            businessName={content.sharedConfig.businessName}
            footerPhone={content.sharedConfig.footerPhone}
            footerEmail={content.sharedConfig.footerEmail}
            heroEnabled={content.currentConfig.heroEnabled}
            heroTitle={content.currentConfig.heroTitle}
            heroSubtitle={content.currentConfig.heroSubtitle}
            footerDesc={content.currentConfig.footerDesc}
            langBarProps={content.langBarProps}
            updateConfig={content.updateConfig}
            updateSharedConfig={content.updateSharedConfig}
            handleBannerUpload={content.handleBannerUpload}
            handleBannerRemove={content.handleBannerRemove}
            handleLogoFileSelect={content.handleLogoFileSelect}
            handleBannerFileSelect={content.handleBannerFileSelect}
            companyData={content.companyData}
            t={websiteT}
          />
        );
      case 'shop':
        return (
          <ShopPanel
            enableCheckout={content.currentConfig.enableCheckout}
            handleSetCheckout={content.handleSetCheckout}
            featuredSections={content.currentConfig.featuredSections || []}
            handleSetFeaturedSections={content.handleSetFeaturedSections}
            t={websiteT}
          />
        );
      case 'contact':
        return (
          <ContactPanel
            contact={content.currentConfig.contact}
            langBarProps={content.langBarProps}
            updateConfig={content.updateConfig}
          />
        );
      case 'quote':
        return (
          <QuotePanel
            rfq={content.currentConfig.rfq}
            langBarProps={content.langBarProps}
            updateConfig={content.updateConfig}
            quoteBgInputRef={content.quoteBgFileInputRef}
            handleQuoteBgUpload={content.handleQuoteBgUpload}
            handleQuoteBgFileSelect={content.handleQuoteBgFileSelect}
          />
        );
      case 'appointment':
        return (
          <AppointmentPanel
            appointment={content.currentConfig.appointment}
            langBarProps={content.langBarProps}
            updateConfig={content.updateConfig}
            t={websiteT}
          />
        );
      case 'location':
        return (
          <LocationPanel
            map={content.currentConfig.map}
            businessAddress={content.sharedConfig.businessAddress}
            langBarProps={content.langBarProps}
            updateConfig={content.updateConfig}
            updateAddress={content.updateAddress}
            companyData={content.companyData}
            t={websiteT}
          />
        );
      case 'reviews':
        return (
          <ReviewsPanel
            reviews={content.currentConfig.reviews}
            langBarProps={content.langBarProps}
            updateConfig={content.updateConfig}
            t={websiteT}
          />
        );
      default:
        if (content.currentConfig.customPages?.[resolvedConfigPanelId] !== undefined) {
          return (
            <CustomPagePanel
              panelId={resolvedConfigPanelId}
              pageName={content.currentConfig.customPages[resolvedConfigPanelId]}
              onRename={content.handleCustomPageRename}
              t={websiteT}
            />
          );
        }

        return (
          <div style={{ padding: '40px 48px', textAlign: 'center', color: '#9CA3AF' }}>
            Select a section to configure.
          </div>
        );
    }
  };

  const renderRightPane = () => {
    if (currentStep === 0) {
      return (
        <div className="labamu-scrollbar" style={{ height: '100%', overflowY: 'auto', padding: '24px', boxSizing: 'border-box' }}>
          <SectionHeader
            title={t('auth:onboarding.template.title')}
            subtitle={t('auth:onboarding.template.subtitle')}
          />

          <div style={{ marginTop: '28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            {TEMPLATE_OPTIONS.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                selected={selectedTemplate === template.id}
                onSelect={setSelectedTemplate}
                t={t}
              />
            ))}
          </div>
        </div>
      );
    }

    if (currentStep === 3 && resolvedConfigPanelId) {
      return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF' }}>
          <div style={{ padding: '12px 48px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', flexShrink: 0, height: '64px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>{selectedConfigPanelTitle}</h3>
            <button
              type="button"
              onClick={() => setActiveConfigPanel(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B5563', transition: 'background 0.2s', borderRadius: '8px' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>
          <div className="labamu-scrollbar" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', background: '#FFFFFF', maxHeight: 'calc(100vh - 136px)' }}>
            {renderConfigPanelContent()}
          </div>
        </div>
      );
    }

    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: '#FFFFFF' }}>
        <div style={{ padding: '10px 24px', background: '#FFFFFF', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: '8px', padding: '4px', gap: '4px' }}>
            <button
              onClick={() => setViewport('desktop')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                transition: 'all 0.2s',
                background: viewport === 'desktop' ? '#FFFFFF' : 'transparent',
                color: viewport === 'desktop' ? '#006BFF' : '#6B7280',
                boxShadow: viewport === 'desktop' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              Desktop
            </button>
            <button
              onClick={() => setViewport('mobile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                transition: 'all 0.2s',
                background: viewport === 'mobile' ? '#FFFFFF' : 'transparent',
                color: viewport === 'mobile' ? '#006BFF' : '#6B7280',
                boxShadow: viewport === 'mobile' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              Mobile
            </button>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowX: viewport === 'mobile' ? 'auto' : 'hidden',
            overflowY: 'hidden',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: viewport === 'mobile' ? 'center' : 'stretch',
            padding: viewport === 'mobile' ? '40px 0' : '0',
            background: '#FFFFFF',
          }}
        >
          <div
            style={{
              minWidth: viewport === 'desktop' ? '0' : '375px',
              width: viewport === 'desktop' ? '100%' : '375px',
              height: viewport === 'mobile' ? '812px' : '100%',
              background: '#FFF',
              boxShadow: viewport === 'mobile' ? '0 20px 50px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              borderRadius: viewport === 'mobile' ? '36px' : '0',
              overflow: 'hidden',
              margin: viewport === 'mobile' ? '0 auto' : '0',
              border: viewport === 'mobile' ? '12px solid #D1D1D6' : 'none',
              boxSizing: 'content-box',
              transform: viewport === 'mobile' ? 'translateZ(0)' : 'none',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                overflowY: 'auto',
                overflowX: 'hidden',
                background: '#FFF',
                borderRadius: viewport === 'mobile' ? '18px' : '0',
                paddingLeft: viewport === 'mobile' ? '14px' : '0',
              }}
            >
              <ErrorBoundary key={`${viewport}-${currentStep}`}>
                <HouzezPreview
                  builderConfig={{ ...content.currentConfig, ...content.sharedConfig }}
                  previewLanguages={content.languages}
                  builderActiveLang={content.activeLang}
                  isBuilderMode={true}
                  isMobile={viewport === 'mobile'}
                  selectedFeatures={deferredSelectedFeatures}
                  featureOrder={deferredFeatureOrder}
                />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const footerPrimaryLabel = currentStep === steps.length - 1 ? websiteT('studio.publish.publishBtn') : t('auth:onboarding.footer.continue');

  return (
    <>
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: "'Lato', sans-serif", background: 'var(--neutral-surface-primary)' }}>
        <style>{`
          .onboarding-main {
            min-height: 0;
            background: var(--neutral-surface-primary);
          }

          .onboarding-footer {
            background: var(--neutral-surface-primary);
            position: relative;
            z-index: 20;
          }

          .onboarding-body {
            display: flex;
            min-height: 0;
            position: relative;
            background: var(--neutral-surface-primary);
          }

          .onboarding-sidebar {
            border-right: 1px solid var(--neutral-line-separator-1);
            background: var(--neutral-surface-primary);
            min-height: 0;
          }

          .onboarding-right-column {
            min-height: 0;
            background: var(--neutral-surface-primary);
          }

          @media (max-width: 720px) {
            .onboarding-footer {
              height: auto !important;
              padding: 16px 16px 20px !important;
              flex-direction: column;
              align-items: stretch;
              gap: 16px;
            }

            .onboarding-footer-language {
              width: 100%;
            }

            .onboarding-footer-actions {
              width: 100%;
              justify-content: flex-end;
            }
          }
        `}</style>

        <header
          style={{
            height: '72px',
            background: 'var(--neutral-surface-primary)',
            borderBottom: '1px solid var(--neutral-line-separator-1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            flexShrink: 0,
            boxSizing: 'border-box',
          }}
        >
          <div style={{ width: '25%', minWidth: '150px' }}>
            <div style={{ fontSize: '24px', lineHeight: '28px', fontWeight: 800, letterSpacing: '-0.02em' }}>
              <span style={{ color: 'var(--feature-brand-primary)' }}>Labamu</span>
              <span style={{ color: 'var(--neutral-on-surface-tertiary)' }}>Ecommerce</span>
            </div>
            <div style={{ marginTop: '4px', fontSize: '14px', lineHeight: '20px', color: 'var(--neutral-on-surface-secondary)' }}>
              {t('auth:onboarding.header.by')}
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
            <Stepper steps={steps} currentStep={currentStep} />
          </div>

          <div style={{ width: '25%', minWidth: '200px', display: 'flex', justifyContent: 'flex-end' }}>
            {currentStep > 0 && (
              <Button
                variant="tertiary"
                size="main"
                onClick={handleSkipWebsiteSetup}
                style={{ height: '44px', padding: '0 8px', whiteSpace: 'nowrap' }}
              >
                {t('auth:onboarding.skip.button')}
              </Button>
            )}
          </div>
        </header>

        <main
          className="onboarding-main"
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            boxSizing: 'border-box',
          }}
        >
          <div className="onboarding-body" style={{ flex: 1, minHeight: 0, overflow: 'visible' }}>
            <aside
              className="onboarding-sidebar"
              style={{
                width: isSidebarOpen ? '440px' : '0px',
                height: '100%',
                alignSelf: 'stretch',
                borderRight: isSidebarOpen ? '1px solid var(--neutral-line-separator-1)' : 'none',
                background: 'var(--neutral-surface-primary)',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div
                  className="labamu-scrollbar"
                  style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    padding: isSidebarOpen ? '24px 24px 24px' : '24px 0 24px',
                    minWidth: isSidebarOpen ? '400px' : '0px',
                    opacity: isSidebarOpen ? 1 : 0,
                    transition: 'opacity 0.2s',
                    boxSizing: 'border-box',
                  }}
                >
                  {currentStep === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', minHeight: '100%' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingBottom: '20px', background: 'var(--neutral-surface-primary)', position: 'sticky', top: '-24px', zIndex: 5, margin: '-24px -24px 0', padding: '24px 24px 20px', boxShadow: '0 1px 0 #E5E7EB' }}>
                        <h2 style={{ margin: 0, fontSize: '20px', lineHeight: '28px', fontWeight: 800, color: 'var(--neutral-on-surface-primary)' }}>
                          {t('auth:onboarding.basic.title')}
                        </h2>
                        <p style={{ margin: 0, fontSize: '14px', lineHeight: '22px', color: 'var(--neutral-on-surface-secondary)' }}>
                          {t('auth:onboarding.basic.subtitle')}
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: 'var(--neutral-on-surface-primary)', marginBottom: '4px' }}>
                            <span style={{ color: 'var(--status-red-primary)', marginRight: '4px' }}>*</span>
                            {t('auth:onboarding.basic.syncPlatform')}
                          </label>
                          <p style={{ margin: '0 0 12px', fontSize: '13px', lineHeight: '20px', color: 'var(--neutral-on-surface-secondary)' }}>
                            {t('auth:onboarding.basic.syncSubtitle')}
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {fromBoth && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '12px 14px',
                                borderRadius: '12px',
                                background: '#FFF8E6',
                                border: '1px solid #F5C842',
                              }}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                                  <path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="#B07D00" strokeWidth="1.4" strokeLinejoin="round" />
                                  <path d="M8 6v3.5M8 11.5h.01" stroke="#B07D00" strokeWidth="1.4" strokeLinecap="round" />
                                </svg>
                                <p style={{ margin: 0, fontSize: '13px', lineHeight: '20px', color: '#7A5500' }}>
                                  <strong>Important:</strong> The sync platform you select cannot be changed after you complete the onboarding.
                                </p>
                              </div>
                            )}
                            {PLATFORM_OPTIONS.map((option) => {
                              let effectiveOption = option;
                              if (fromMRP) {
                                effectiveOption = { ...option, disabled: option.id === 'labamu-app' };
                              } else if (fromBoth) {
                                effectiveOption = { ...option, disabled: false };
                              }
                              return (
                                <div
                                  key={option.id}
                                  onClick={() => !effectiveOption.disabled && setSelectedPlatform(option.id)}
                                >
                                  <PlatformCard option={effectiveOption} selectedPlatform={selectedPlatform} t={t} />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: 'var(--neutral-on-surface-primary)', marginBottom: '8px' }}>
                            <span style={{ color: 'var(--status-red-primary)', marginRight: '4px' }}>*</span>
                            {t('auth:onboarding.basic.businessName')}
                          </label>
                          <input
                            value={content.sharedConfig.businessName}
                            onChange={(event) => content.updateSharedConfig('businessName', event.target.value)}
                            placeholder="LB Business"
                            style={{
                              width: '100%',
                              height: '56px',
                              borderRadius: '14px',
                              border: '1px solid var(--neutral-line-separator-2)',
                              padding: '0 18px',
                              fontSize: '16px',
                              lineHeight: '24px',
                              fontFamily: "'Lato', sans-serif",
                              color: 'var(--neutral-on-surface-primary)',
                              outline: 'none',
                              background: 'var(--neutral-surface-primary)',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: 'var(--neutral-on-surface-primary)', marginBottom: '8px' }}>
                            <span style={{ color: 'var(--status-red-primary)', marginRight: '4px' }}>*</span>
                            {t('auth:onboarding.basic.businessLogo')}
                          </label>
                          <LogoUploadBox
                            logoPreview={content.sharedConfig.headerLogo}
                            inputRef={content.logoFileInputRef}
                            onSelectLogo={() => content.logoFileInputRef.current?.click()}
                            onLogoFileSelect={content.handleLogoFileSelect}
                            onClearLogo={() => content.updateSharedConfig('headerLogo', '')}
                            t={t}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: 'var(--neutral-on-surface-primary)', marginBottom: '4px' }}>
                            <span style={{ color: 'var(--status-red-primary)', marginRight: '4px' }}>*</span>
                            {t('auth:onboarding.basic.websiteLanguage')}
                          </label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            {LANGUAGE_OPTIONS.map((option) => {
                              const selected = websiteLanguage === option.id;
                              return (
                                <button
                                  key={option.id}
                                  type="button"
                                  onClick={() => syncWebsiteLanguageSelection(option.id)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px',
                                    background: 'transparent',
                                    border: 'none',
                                    padding: 0,
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    color: 'var(--neutral-on-surface-primary)',
                                  }}
                                >
                                  <div
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '50%',
                                      border: selected ? '2px solid var(--feature-brand-primary)' : '1px solid var(--neutral-line-separator-2)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      background: 'var(--neutral-surface-primary)',
                                      flexShrink: 0,
                                    }}
                                  >
                                    {selected && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--feature-brand-primary)' }} />}
                                  </div>
                                  <span style={{ fontSize: '16px', lineHeight: '24px' }}>{t(option.labelKey)}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 1 && (
                    <div style={{ padding: '0', boxSizing: 'border-box' }}>
                      <StylingStep
                        primaryColor={content.currentConfig.primaryColor || '#1D4ED8'}
                        fontFamily={content.currentConfig.fontFamily || 'Inter'}
                        updateConfig={content.updateConfig}
                        t={websiteT}
                      />
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div style={{ padding: '0', boxSizing: 'border-box' }}>
                      <FeaturesStep
                        featureOrder={features.featureOrder}
                        selectedFeatures={features.selectedFeatures}
                        enableCheckout={content.currentConfig.enableCheckout}
                        customPages={content.currentConfig.customPages}
                        AVAILABLE_FEATURES={features.AVAILABLE_FEATURES}
                        draggedIdx={features.draggedIdx}
                        dropTargetIdx={features.dropTargetIdx}
                        handleToggleFeature={features.handleToggleFeature}
                        handleAddCustomPage={features.handleAddCustomPage}
                        handleRemoveCustomPage={features.handleRemoveCustomPage}
                        handleRenameCustomPage={features.handleRenameCustomPage}
                        handleDragStart={features.handleDragStart}
                        handleDragEnd={features.handleDragEnd}
                        handleDragOver={features.handleDragOver}
                        handleDrop={features.handleDrop}
                        handleContainerDragOver={features.handleContainerDragOver}
                        handleEndZoneDragOver={features.handleEndZoneDragOver}
                        handleSetCheckout={content.handleSetCheckout}
                        t={websiteT}
                      />
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div style={{ padding: '0', boxSizing: 'border-box' }}>
                      <ConfigureStep
                        languages={content.languages}
                        activeLang={content.activeLang}
                        setActiveLang={content.setActiveLang}
                        handleAddLanguage={content.handleAddLanguage}
                        handleRemoveLanguage={content.handleRemoveLanguage}
                        configItems={configItems}
                        activeConfigPanel={activeConfigPanel}
                        setActiveConfigPanel={setActiveConfigPanel}
                        t={websiteT}
                      />
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div style={{ padding: '0', boxSizing: 'border-box' }}>
                      <PublishStep
                        subdomain={publish.subdomain}
                        domainStatus={publish.domainStatus}
                        customDomain={publish.customDomain}
                        handleSubdomainChange={publish.handleSubdomainChange}
                        handleCheckDomain={publish.handleCheckDomain}
                        setCustomDomain={publish.setCustomDomain}
                        t={websiteT}
                      />
                    </div>
                  )}
                </div>
                <div
                  className="onboarding-footer"
                  style={{
                    padding: '16px 24px',
                    borderTop: '1px solid var(--neutral-line-separator-1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    boxSizing: 'border-box',
                    flexShrink: 0,
                    background: 'var(--neutral-surface-primary)',
                    width: '100%',
                  }}
                >
                  <div ref={langMenuRef} className="onboarding-footer-language" style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => setLangMenuOpen((prev) => !prev)}
                      style={{
                        width: '96px',
                        minWidth: '96px',
                        height: '44px',
                        borderRadius: '12px',
                        border: '1px solid var(--neutral-line-separator-1)',
                        background: 'var(--neutral-surface-primary)',
                        padding: '0 10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '6px',
                        cursor: 'pointer',
                        fontFamily: "'Lato', sans-serif",
                        fontSize: '14px',
                        color: 'var(--neutral-on-surface-primary)',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
                        boxSizing: 'border-box',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                        <span aria-hidden="true">{currentLocale === 'id' ? '🇮🇩' : '🇬🇧'}</span>
                        <span>{currentLocale === 'id' ? 'ID' : 'EN'}</span>
                      </span>
                      <ChevronDown size={16} />
                    </button>

                    {langMenuOpen && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 'calc(100% + 8px)',
                          left: 0,
                          width: '100%',
                          minWidth: '180px',
                          background: 'var(--neutral-surface-primary)',
                          border: '1px solid var(--neutral-line-separator-1)',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          boxShadow: '0 12px 28px rgba(0, 0, 0, 0.12)',
                          zIndex: 20,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleLanguageChange('id')}
                          style={{
                            width: '100%',
                            height: '44px',
                            padding: '0 16px',
                            border: 'none',
                            background: currentLocale === 'id' ? 'var(--feature-brand-container-lighter)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontFamily: "'Lato', sans-serif",
                            fontSize: '14px',
                            color: 'var(--neutral-on-surface-primary)',
                          }}
                        >
                          🇮🇩 Indonesia
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLanguageChange('en')}
                          style={{
                            width: '100%',
                            height: '44px',
                            padding: '0 16px',
                            border: 'none',
                            background: currentLocale === 'en' ? 'var(--feature-brand-container-lighter)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontFamily: "'Lato', sans-serif",
                            fontSize: '14px',
                            color: 'var(--neutral-on-surface-primary)',
                          }}
                        >
                          🇬🇧 English
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="onboarding-footer-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto', flexShrink: 0, flexWrap: 'nowrap' }}>
                    {currentStep > 0 && (
                      <Button
                        variant="secondary"
                        size="main"
                        onClick={handlePrevious}
                        style={{ height: '44px', padding: '0 18px', whiteSpace: 'nowrap', flexShrink: 0 }}
                      >
                        {t('auth:onboarding.footer.previous')}
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      size="main"
                      onClick={handleContinue}
                      disabled={(currentStep === 0 && !canContinueStepOne) || (currentStep === 1 && !canContinueStepTwo)}
                      style={{ height: '44px', padding: '0 18px', whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                      {footerPrimaryLabel}
                    </Button>
                  </div>
                </div>
              </div>
            </aside>

            <section className="onboarding-right-column" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'visible', position: 'relative' }}>
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen((prev) => !prev)}
                  title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
                  aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                  style={{
                    position: 'absolute',
                    left: '0px',
                    marginLeft: '-1px',
                    top: '24px',
                    zIndex: 99999,
                    background: 'var(--neutral-surface-primary)',
                    border: '1px solid var(--neutral-line-separator-1)',
                    borderLeft: 'none',
                    borderRadius: '0 8px 8px 0',
                    width: '28px',
                    height: '48px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--neutral-on-surface-secondary)',
                    boxShadow: '4px 0 12px rgba(0,0,0,0.05)',
                    outline: 'none',
                    transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <ChevronLeft
                    size={18}
                    strokeWidth={2.5}
                    style={{ transform: isSidebarOpen ? 'none' : 'rotate(180deg)', transition: 'transform 0.3s' }}
                  />
                </button>
              )}
              {renderRightPane()}
            </section>
          </div>
        </main>
      </div>

      {content.cropModal.open && (
        <ImageCropModal
          imageSrc={content.cropModal.imageSrc}
          aspectRatio={content.cropModal.aspectRatio}
          title="Preview Image"
          subtitle="Make sure the image is fully visible and within the area."
          onSave={content.cropModal.onSave}
          onClose={content.closeCropModal}
        />
      )}

      <SkipWebsiteSetupModal
        open={skipModalOpen}
        onClose={() => setSkipModalOpen(false)}
        onConfirm={handleConfirmSkipWebsiteSetup}
        t={t}
      />

      <SyncPlatformConfirmModal
        open={syncPlatformConfirmOpen}
        onClose={handleCloseSyncPlatformConfirm}
        onConfirm={handleConfirmSyncPlatform}
        selectedPlatform={selectedPlatform}
        t={t}
      />
    </>
  );
}
