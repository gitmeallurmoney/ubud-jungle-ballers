// Main app — root component, wires Tweaks to body data attrs
const { useTweaks } = window;

function App() {
  const [tweaks, setTweak] = useTweaks(window.TWEAK_DEFAULTS);

  React.useEffect(() => {
    document.body.dataset.palette = tweaks.palette;
    document.body.dataset.headline = tweaks.headlineFont;
  }, [tweaks.palette, tweaks.headlineFont]);

  return (
    <>
      <Nav page="home" />
      <Hero variant={tweaks.heroVariant} />
      {tweaks.showTicker && <Ticker />}
      <Fixture />
      <Manifesto />
      <SquadPreview />
      <Kit />
      <Gallery />
      <Community />
      <Sponsors />
      <Newsletter />
      <Footer />

      <window.TweaksPanel title="Tweaks">
        <window.TweakSection title="Palette">
          <window.TweakRadio
            label="Color"
            value={tweaks.palette}
            options={[
              { value: "jungle", label: "Jungle" },
              { value: "bone",   label: "Bone" },
              { value: "acid",   label: "Acid" }
            ]}
            onChange={(v) => setTweak("palette", v)}
          />
        </window.TweakSection>

        <window.TweakSection title="Headline type">
          <window.TweakRadio
            label="Display font"
            value={tweaks.headlineFont}
            options={[
              { value: "anton",     label: "Anton" },
              { value: "narrow",    label: "Narrow" },
              { value: "bricolage", label: "Bricolage" }
            ]}
            onChange={(v) => setTweak("headlineFont", v)}
          />
        </window.TweakSection>

        <window.TweakSection title="Behavior">
          <window.TweakToggle
            label="Show ticker bar"
            value={tweaks.showTicker}
            onChange={(v) => setTweak("showTicker", v)}
          />
        </window.TweakSection>
      </window.TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
