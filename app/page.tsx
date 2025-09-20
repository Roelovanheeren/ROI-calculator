import ROICalculator from '../components/ROICalculator'

// Force Railway redeploy to pick up GHL_API_KEY environment variable
export default function Home() {
  return (
    <main>
      <ROICalculator />
    </main>
  )
}
