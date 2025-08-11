import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Sun, Wind, Battery, Zap, TrendingUp, AlertTriangle, CheckCircle, XCircle, 
         Calculator, Leaf, Clock, Bell, BarChart3, Download, Settings, DollarSign, 
         CloudRain, Thermometer, Eye } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
         AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import EnhancedFeatures from '@/components/EnhancedFeatures';

interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  country: string;
}

interface EnergyData {
  solar: {
    current: number;
    average: number;
    peak: number;
    data: Array<{ time: string; value: number }>;
  };
  wind: {
    current: number;
    average: number;
    peak: number;
    data: Array<{ time: string; value: number }>;
  };
}

interface BatteryState {
  capacity: number;
  currentCharge: number;
  percentage: number;
  runtime: number;
}

interface EnergyConsumption {
  dailyDemand: number;
  peakHours: string;
  appliances: Array<{ name: string; power: number; hours: number }>;
}

interface CostAnalysis {
  gridCost: number;
  renewableSavings: number;
  paybackPeriod: number;
  annualSavings: number;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  clouds: number;
  condition: string;
}

interface EnhancedRecommendation {
  type: 'solar' | 'wind' | 'battery' | 'grid' | 'economic' | 'environmental';
  priority: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  action: string;
  timeframe: string;
  impact: number;
  confidence: number;
}

interface Recommendation {
  type: 'solar' | 'wind' | 'battery' | 'grid';
  priority: 'high' | 'medium' | 'low';
  message: string;
  action: string;
}

interface FeasibilityResult {
  status: 'optimal' | 'moderate' | 'not-recommended';
  score: number;
  reason: string;
  icon: typeof CheckCircle | typeof AlertTriangle | typeof XCircle;
}

interface CarbonFootprint {
  currentEmissions: number;
  renewableReduction: number;
  annualSavings: number;
  treesEquivalent: number;
}

const EnerShiftDashboard = () => {
  const { toast } = useToast();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [energyData, setEnergyData] = useState<EnergyData | null>(null);
  const [battery, setBattery] = useState<BatteryState>({
    capacity: 100,
    currentCharge: 75,
    percentage: 75,
    runtime: 0
  });
  const [recommendations, setRecommendations] = useState<EnhancedRecommendation[]>([]);
  const [feasibility, setFeasibility] = useState<FeasibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [manualLocation, setManualLocation] = useState({ lat: '', lon: '' });
  
  // Enhanced state
  const [energyConsumption, setEnergyConsumption] = useState<EnergyConsumption>({
    dailyDemand: 25,
    peakHours: '18:00-22:00',
    appliances: [
      { name: 'LED Lights', power: 0.5, hours: 8 },
      { name: 'Refrigerator', power: 1.2, hours: 24 },
      { name: 'Mobile Charging', power: 0.1, hours: 4 }
    ]
  });
  
  const [costAnalysis, setCostAnalysis] = useState<CostAnalysis>({
    gridCost: 8.5,
    renewableSavings: 0,
    paybackPeriod: 0,
    annualSavings: 0
  });
  
  const [carbonFootprint, setCarbonFootprint] = useState<CarbonFootprint>({
    currentEmissions: 0,
    renewableReduction: 0,
    annualSavings: 0,
    treesEquivalent: 0
  });
  
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Auto-detect location on mount
  useEffect(() => {
    detectLocation();
  }, []);

  // Update battery percentage and runtime when values change
  useEffect(() => {
    const percentage = (battery.currentCharge / battery.capacity) * 100;
    const averageDemand = energyData ? (energyData.solar.average + energyData.wind.average) / 2 : 5;
    const runtime = battery.currentCharge / (averageDemand || 5);
    
    setBattery(prev => ({
      ...prev,
      percentage,
      runtime
    }));
  }, [battery.capacity, battery.currentCharge, energyData]);

  // Generate recommendations and feasibility when data changes
  useEffect(() => {
    if (energyData && location) {
      generateRecommendations();
      calculateFeasibility();
    }
  }, [energyData, battery, location]);

  const detectLocation = async () => {
    setLoading(true);
    try {
      // Try geolocation first
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await fetchLocationData(latitude, longitude);
          },
          () => {
            // Fallback to IP-based detection
            fetchIPLocation();
          }
        );
      } else {
        fetchIPLocation();
      }
    } catch (error) {
      console.error('Location detection failed:', error);
      toast({
        title: "Location Detection Failed",
        description: "Please enter coordinates manually",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const fetchIPLocation = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      await fetchLocationData(data.latitude, data.longitude);
    } catch (error) {
      console.error('IP location failed:', error);
      setLoading(false);
    }
  };

  const fetchLocationData = async (lat: number, lon: number) => {
    try {
      // Fetch reverse geocoding
      const geoResponse = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      const geoData = await geoResponse.json();
      
      setLocation({
        latitude: lat,
        longitude: lon,
        city: geoData.city || 'Unknown',
        region: geoData.principalSubdivision || 'Unknown',
        country: geoData.countryName || 'Unknown'
      });

      // Fetch NASA POWER data
      await fetchEnergyData(lat, lon);
    } catch (error) {
      console.error('Failed to fetch location data:', error);
      toast({
        title: "Failed to fetch location data",
        description: "Please try again or enter coordinates manually",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEnergyData = async (lat: number, lon: number) => {
    try {
      const today = new Date();
      const startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      
      const startDateStr = startDate.toISOString().split('T')[0].replace(/-/g, '');
      const endDateStr = today.toISOString().split('T')[0].replace(/-/g, '');

      // NASA POWER API for solar and wind data
      const solarResponse = await fetch(
        `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${lon}&latitude=${lat}&start=${startDateStr}&end=${endDateStr}&format=JSON`
      );
      
      const windResponse = await fetch(
        `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=WS10M&community=RE&longitude=${lon}&latitude=${lat}&start=${startDateStr}&end=${endDateStr}&format=JSON`
      );

      const solarData = await solarResponse.json();
      const windData = await windResponse.json();

      // Process solar data
      const solarValues = Object.values(solarData.properties.parameter.ALLSKY_SFC_SW_DWN || {}) as number[];
      const solarChartData = Object.entries(solarData.properties.parameter.ALLSKY_SFC_SW_DWN || {})
        .slice(-7)
        .map(([date, value]) => ({
          time: new Date(date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')).toLocaleDateString(),
          value: Number(value)
        }));

      // Process wind data
      const windValues = Object.values(windData.properties.parameter.WS10M || {}) as number[];
      const windChartData = Object.entries(windData.properties.parameter.WS10M || {})
        .slice(-7)
        .map(([date, value]) => ({
          time: new Date(date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')).toLocaleDateString(),
          value: Number(value)
        }));

      setEnergyData({
        solar: {
          current: solarValues[solarValues.length - 1] || 0,
          average: solarValues.reduce((a, b) => a + b, 0) / solarValues.length || 0,
          peak: Math.max(...solarValues) || 0,
          data: solarChartData
        },
        wind: {
          current: windValues[windValues.length - 1] || 0,
          average: windValues.reduce((a, b) => a + b, 0) / windValues.length || 0,
          peak: Math.max(...windValues) || 0,
          data: windChartData
        }
      });

      toast({
        title: "Energy Data Updated",
        description: "Real-time data from NASA POWER API",
      });

    } catch (error) {
      console.error('Failed to fetch energy data:', error);
      toast({
        title: "Failed to fetch energy data",
        description: "Using fallback data",
        variant: "destructive"
      });
      
      // Fallback data for demo
      setEnergyData({
        solar: {
          current: 4.2,
          average: 5.1,
          peak: 8.3,
          data: [
            { time: 'Day 1', value: 4.2 },
            { time: 'Day 2', value: 5.8 },
            { time: 'Day 3', value: 6.1 },
            { time: 'Day 4', value: 3.9 },
            { time: 'Day 5', value: 7.2 },
            { time: 'Day 6', value: 8.1 },
            { time: 'Day 7', value: 5.4 }
          ]
        },
        wind: {
          current: 3.8,
          average: 4.2,
          peak: 7.9,
          data: [
            { time: 'Day 1', value: 3.8 },
            { time: 'Day 2', value: 4.5 },
            { time: 'Day 3', value: 2.9 },
            { time: 'Day 4', value: 5.2 },
            { time: 'Day 5', value: 6.8 },
            { time: 'Day 6', value: 4.1 },
            { time: 'Day 7', value: 3.3 }
          ]
        }
      });
    }
  };

  const generateRecommendations = () => {
    if (!energyData) return;

    const recs: EnhancedRecommendation[] = [];
    const { solar, wind } = energyData;
    const currentHour = new Date().getHours();
    const isDaytime = currentHour >= 6 && currentHour <= 18;

    // Enhanced Solar recommendations with AI logic
    if (solar.current > 5 && battery.percentage < 50) {
      recs.push({
        type: 'solar',
        priority: 'critical',
        message: 'Excellent solar conditions detected',
        action: 'Maximize solar charging immediately',
        timeframe: isDaytime ? 'Next 2-4 hours' : 'Tomorrow 10AM-2PM',
        impact: 85,
        confidence: 92
      });
    }

    // Wind optimization recommendations
    if (wind.current > 5 && battery.percentage < 70) {
      recs.push({
        type: 'wind',
        priority: 'high',
        message: 'Strong wind speeds available',
        action: 'Activate wind turbine charging',
        timeframe: 'Next 6 hours',
        impact: 70,
        confidence: 88
      });
    }

    // Economic optimization
    if (solar.average > 4 && wind.average > 3) {
      const savings = (solar.average + wind.average) * costAnalysis.gridCost * 0.8;
      recs.push({
        type: 'economic',
        priority: 'medium',
        message: `Potential daily savings: ₹${savings.toFixed(0)}`,
        action: 'Optimize renewable mix for maximum ROI',
        timeframe: 'Daily optimization',
        impact: 60,
        confidence: 85
      });
    }

    // Environmental recommendations
    const carbonReduction = (energyConsumption.dailyDemand * 0.82) / 1000; // kg CO2
    if (carbonReduction > 0.5) {
      recs.push({
        type: 'environmental',
        priority: 'medium',
        message: `Reduce ${carbonReduction.toFixed(1)}kg CO2 daily`,
        action: 'Switch to 100% renewable energy',
        timeframe: 'Continuous',
        impact: 90,
        confidence: 95
      });
    }

    // Critical battery warnings
    if (battery.percentage < 20) {
      recs.push({
        type: 'battery',
        priority: 'critical',
        message: 'Critical battery level detected',
        action: 'Switch to grid backup immediately',
        timeframe: 'Immediate',
        impact: 100,
        confidence: 100
      });
    }

    // Weather-based recommendations
    if (solar.current < 3 && wind.current < 3) {
      recs.push({
        type: 'grid',
        priority: 'high',
        message: 'Low renewable availability',
        action: 'Use grid power during off-peak hours',
        timeframe: 'Next 12 hours',
        impact: 45,
        confidence: 80
      });
    }

    setRecommendations(recs);
  };

  const calculateFeasibility = () => {
    if (!energyData) return;

    const { solar, wind } = energyData;
    let score = 0;
    let reasons = [];

    // Solar scoring
    if (solar.average > 6) {
      score += 40;
      reasons.push('excellent solar availability');
    } else if (solar.average > 4) {
      score += 25;
      reasons.push('good solar potential');
    } else {
      score += 10;
      reasons.push('limited solar resources');
    }

    // Wind scoring
    if (wind.average > 5) {
      score += 30;
      reasons.push('strong wind resources');
    } else if (wind.average > 3) {
      score += 20;
      reasons.push('moderate wind potential');
    } else {
      score += 5;
      reasons.push('low wind availability');
    }

    // Battery efficiency scoring
    if (battery.runtime > 12) {
      score += 20;
      reasons.push('sufficient battery capacity');
    } else if (battery.runtime > 6) {
      score += 15;
      reasons.push('adequate battery runtime');
    } else {
      score += 5;
      reasons.push('limited battery capacity');
    }

    // Reliability scoring  
    if (solar.peak > 7 || wind.peak > 6) {
      score += 10;
      reasons.push('reliable energy peaks');
    }

    // Determine status
    let status: FeasibilityResult['status'];
    let icon: FeasibilityResult['icon'];
    
    if (score >= 80) {
      status = 'optimal';
      icon = CheckCircle;
    } else if (score >= 60) {
      status = 'moderate';  
      icon = AlertTriangle;
    } else {
      status = 'not-recommended';
      icon = XCircle;
    }

    setFeasibility({
      status,
      score,
      reason: reasons.join(', '),
      icon
    });
  };

  const handleManualLocation = async () => {
    const lat = parseFloat(manualLocation.lat);
    const lon = parseFloat(manualLocation.lon);
    
    if (isNaN(lat) || isNaN(lon)) {
      toast({
        title: "Invalid Coordinates",
        description: "Please enter valid latitude and longitude",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    await fetchLocationData(lat, lon);
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl lg:text-6xl font-bold energy-gradient bg-clip-text text-transparent">
            EnerShift
          </h1>
          <p className="text-xl text-muted-foreground">Smart Rural Energy Simulator</p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>NASA POWER API</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>AI-Powered Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <Battery className="w-4 h-4" />
              <span>Real-time Optimization</span>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <Card className="glass-card p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Location Detection</h2>
            </div>
            
            {location ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{location.city}</Badge>
                  <Badge variant="outline">{location.region}</Badge>
                  <Badge variant="outline">{location.country}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">Enter coordinates manually:</p>
                <div className="flex gap-4">
                  <Input
                    placeholder="Latitude"
                    value={manualLocation.lat}
                    onChange={(e) => setManualLocation(prev => ({ ...prev, lat: e.target.value }))}
                  />
                  <Input
                    placeholder="Longitude"
                    value={manualLocation.lon}
                    onChange={(e) => setManualLocation(prev => ({ ...prev, lon: e.target.value }))}
                  />
                  <Button onClick={handleManualLocation} disabled={loading}>
                    {loading ? 'Loading...' : 'Fetch Data'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Dashboard Overview</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Features</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
        {energyData && (
          <>
            {/* Energy Data Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Solar Card */}
              <Card className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-energy-solar" />
                  <h3 className="text-xl font-semibold">Solar Availability</h3>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-energy-solar">
                      {energyData.solar.current.toFixed(1)}
                    </p>
                    <p className="text-sm text-muted-foreground">Current kWh/m²</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {energyData.solar.average.toFixed(1)}
                    </p>
                    <p className="text-sm text-muted-foreground">Average</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {energyData.solar.peak.toFixed(1)}
                    </p>
                    <p className="text-sm text-muted-foreground">Peak</p>
                  </div>
                </div>

                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={energyData.solar.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="hsl(var(--solar))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--solar))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Wind Card */}
              <Card className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Wind className="w-5 h-5 text-energy-wind" />
                  <h3 className="text-xl font-semibold">Wind Availability</h3>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-energy-wind">
                      {energyData.wind.current.toFixed(1)}
                    </p>
                    <p className="text-sm text-muted-foreground">Current m/s</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {energyData.wind.average.toFixed(1)}
                    </p>
                    <p className="text-sm text-muted-foreground">Average</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {energyData.wind.peak.toFixed(1)}
                    </p>
                    <p className="text-sm text-muted-foreground">Peak</p>
                  </div>
                </div>

                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={energyData.wind.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="hsl(var(--wind))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--wind))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Battery Section */}
            <Card className="glass-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Battery className="w-5 h-5 text-energy-battery" />
                <h3 className="text-xl font-semibold">Battery Status</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Capacity (kWh)</label>
                      <Input
                        type="number"
                        value={battery.capacity}
                        onChange={(e) => setBattery(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                        min="1"
                        max="1000"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Current Charge (kWh)</label>
                      <Input
                        type="number"
                        value={battery.currentCharge}
                        onChange={(e) => setBattery(prev => ({ ...prev, currentCharge: Number(e.target.value) }))}
                        min="0"
                        max={battery.capacity}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-energy-battery">
                      {battery.percentage.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Battery Level</p>
                  </div>
                  
                  <Progress value={battery.percentage} className="h-3" />
                  
                  <div className="text-center">
                    <p className="text-lg font-semibold">
                      {battery.runtime.toFixed(1)} hours
                    </p>
                    <p className="text-sm text-muted-foreground">Estimated Runtime</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* AI Recommendations */}
            {recommendations.length > 0 && (
              <Card className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-semibold">AI Recommendations</h3>
                </div>

                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="p-4 rounded-lg bg-muted/50 border">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          rec.type === 'solar' ? 'bg-energy-solar/20' :
                          rec.type === 'wind' ? 'bg-energy-wind/20' :
                          rec.type === 'battery' ? 'bg-energy-battery/20' :
                          'bg-energy-grid/20'
                        }`}>
                          {rec.type === 'solar' && <Sun className="w-4 h-4 text-energy-solar" />}
                          {rec.type === 'wind' && <Wind className="w-4 h-4 text-energy-wind" />}
                          {rec.type === 'battery' && <Battery className="w-4 h-4 text-energy-battery" />}
                          {rec.type === 'grid' && <Zap className="w-4 h-4 text-energy-grid" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{rec.message}</p>
                          <p className="text-sm text-muted-foreground mt-1">{rec.action}</p>
                          <Badge 
                            variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}
                            className="mt-2"
                          >
                            {rec.priority} priority
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Implementation Feasibility */}
            {feasibility && (
              <Card className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <feasibility.icon className={`w-5 h-5 ${
                    feasibility.status === 'optimal' ? 'text-energy-battery' :
                    feasibility.status === 'moderate' ? 'text-energy-solar' :
                    'text-destructive'
                  }`} />
                  <h3 className="text-xl font-semibold">Implementation Feasibility</h3>
                </div>

                <div className="text-center space-y-4">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold ${
                    feasibility.status === 'optimal' ? 'bg-energy-battery/20 text-energy-battery' :
                    feasibility.status === 'moderate' ? 'bg-energy-solar/20 text-energy-solar' :
                    'bg-destructive/20 text-destructive'
                  }`}>
                    <feasibility.icon className="w-5 h-5" />
                    {feasibility.status === 'optimal' ? '✅ Optimal' :
                     feasibility.status === 'moderate' ? '⚠️ Moderate' :
                     '❌ Not Recommended'}
                  </div>

                  <div className="space-y-2">
                    <p className="text-lg">Feasibility Score: {feasibility.score}/100</p>
                    <Progress value={feasibility.score} className="h-3" />
                    <p className="text-muted-foreground">
                      Assessment based on: {feasibility.reason}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <EnhancedFeatures 
              energyData={energyData} 
              battery={battery} 
              location={location} 
            />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-4">
          <p>Data is provided by NASA POWER API using satellite measurements. No physical sensors are required.</p>
        </div>
      </div>
    </div>
  );
};

export default EnerShiftDashboard;