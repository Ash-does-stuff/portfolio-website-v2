import WelcomeAnimation from "./components/general/WelcomeAnimation"
import Homepage from "./pages/Homepage"
import { useSpecialClassHandler } from "./scripts/hooks/useSpecialClassHandler"

function App() {

  useSpecialClassHandler()

  return (
    <>
      <WelcomeAnimation/>
      
      <Homepage/>
    </>
  )
}

export default App
