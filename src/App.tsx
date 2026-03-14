import { useUIStore, Screen } from './stores/uiStore';
import { TitleScreen } from './components/screens/TitleScreen';
import { LoreIntro } from './components/screens/LoreIntro';
import { LoadoutSelect } from './components/screens/LoadoutSelect';
import { MapScreen } from './components/screens/MapScreen';
import './App.css';

function App() {
  const currentScreen = useUIStore((s) => s.currentScreen);

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.Title:
        return <TitleScreen />;
      case Screen.LoreIntro:
        return <LoreIntro />;
      case Screen.LoadoutSelect:
        return <LoadoutSelect />;
      case Screen.Map:
        return <MapScreen />;
      default:
        return (
          <div className="screen placeholder-screen">
            <p>{currentScreen}</p>
            <button
              className="btn"
              onClick={() => useUIStore.getState().setScreen(Screen.Title)}
            >
              Back to Title
            </button>
          </div>
        );
    }
  };

  return <div className="app">{renderScreen()}</div>;
}

export default App;
