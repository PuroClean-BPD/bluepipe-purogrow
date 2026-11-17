import purocleanLogoHorizontal from "@/assets/puroclean-logo-horizontal.png";

/**
 * "Preferred SPAR Partner" trust strip.
 * PuroClean brand guide: official two-color logo on a light, uncluttered
 * background; clear space on all four sides equal to the logo's "P" height
 * (~66% of the logo's rendered height); no stretching, recoloring, effects.
 */
const LOGO_HEIGHT_MOBILE = 44; // px
const LOGO_HEIGHT_DESKTOP = 56; // px
const P_HEIGHT_RATIO = 0.66;

const SparPartnerStrip = () => {
  return (
    <section aria-label="Preferred SPAR Partner" className="bg-white border-b border-slate-200">
      <style>{`
        .spar-logo-clear { padding: ${Math.ceil(LOGO_HEIGHT_MOBILE * P_HEIGHT_RATIO)}px; }
        .spar-logo-clear img { height: ${LOGO_HEIGHT_MOBILE}px; width: auto; max-width: none; }
        @media (min-width: 768px) {
          .spar-logo-clear { padding: ${Math.ceil(LOGO_HEIGHT_DESKTOP * P_HEIGHT_RATIO)}px; }
          .spar-logo-clear img { height: ${LOGO_HEIGHT_DESKTOP}px; }
        }
      `}</style>
      <div className="container-main flex flex-col md:flex-row items-center justify-center">
        <div className="spar-logo-clear bg-white">
          <img
            src={purocleanLogoHorizontal}
            alt="PuroClean® logo – The Paramedics of Property Damage"
            loading="eager"
            decoding="async"
          />
        </div>
        <div className="hidden md:block w-px self-stretch my-8 bg-slate-200" aria-hidden="true" />
        <p className="pb-8 md:pb-0 md:pl-10 text-center md:text-left text-lg md:text-xl font-semibold uppercase tracking-[0.18em] text-slate-800">
          Preferred SPAR Partner
        </p>
      </div>
    </section>
  );
};

export default SparPartnerStrip;
