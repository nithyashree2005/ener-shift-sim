import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Leaf, DollarSign, BarChart3, Download, Bell, Settings, 
         Thermometer, CloudRain, TrendingUp, Zap, Sun, Wind, Battery } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
         PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

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

interface CarbonFootprint {
  currentEmissions: number;
  renewableReduction: number;
  annualSavings: number;
  treesEquivalent: number;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  clouds: number;
  condition: string;
}

interface EnhancedFeaturesProps {
  energyData: any;
  battery: any;
  location: any;
}

const EnhancedFeatures = ({ energyData, battery, location }: EnhancedFeaturesProps) => {
  const { toast } = useToast();
  
  const [energyConsumption, setEnergyConsumption] = useState<EnergyConsumption>({
    dailyDemand: 25,
    peakHours: '18:00-22:00',
    appliances: [
      { name: 'LED Lights', power: 0.5, hours: 8 },
      { name: 'Refrigerator', power: 1.2, hours: 24 },
      { name: 'Mobile Charging', power: 0.1, hours: 4 },
      { name: 'Water Pump', power: 2.0, hours: 2 },
      { name: 'TV', power: 0.8, hours: 6 }
    ]
  });
  
  const [costAnalysis, setCostAnalysis] = useState<CostAnalysis>({
    gridCost: 8.5, // ₹ per kWh
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

  // Calculate enhanced metrics when data changes
  useEffect(() => {
    if (energyData && battery) {
      calculateEnhancedMetrics();
      fetchWeatherData();
    }
  }, [energyData, battery, energyConsumption]);

  const calculateEnhancedMetrics = () => {
    // Cost Analysis
    const dailyRenewableGeneration = (energyData.solar.average + energyData.wind.average) * 0.8;
    const dailyGridUsage = Math.max(0, energyConsumption.dailyDemand - dailyRenewableGeneration);
    const dailySavings = (energyConsumption.dailyDemand - dailyGridUsage) * costAnalysis.gridCost;
    const annualSavings = dailySavings * 365;
    
    // Assuming system cost of ₹80,000 for 5kW setup
    const systemCost = 80000;
    const paybackPeriod = annualSavings > 0 ? systemCost / annualSavings : 0;

    setCostAnalysis(prev => ({
      ...prev,
      renewableSavings: dailySavings,
      annualSavings,
      paybackPeriod
    }));

    // Carbon Footprint (India grid emission factor: 0.82 kg CO2/kWh)
    const currentEmissions = energyConsumption.dailyDemand * 0.82;
    const renewableReduction = dailyRenewableGeneration * 0.82;
    const annualCarbonSavings = renewableReduction * 365;
    const treesEquivalent = annualCarbonSavings / 22; // 1 tree absorbs ~22kg CO2/year

    setCarbonFootprint({
      currentEmissions,
      renewableReduction,
      annualSavings: annualCarbonSavings,
      treesEquivalent
    });
  };

  const fetchWeatherData = async () => {
    if (!location) return;
    
    try {
      // Using OpenWeatherMap (you'd need an API key in production)
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=demo&units=metric`
      );
      
      if (response.ok) {
        const data = await response.json();
        setWeatherData({
          temperature: data.main.temp,
          humidity: data.main.humidity,
          clouds: data.clouds.all,
          condition: data.weather[0].main
        });
      }
    } catch (error) {
      // Fallback weather data for demo
      setWeatherData({
        temperature: 28,
        humidity: 65,
        clouds: 30,
        condition: 'Partly Cloudy'
      });
    }
  };

  const addAppliance = () => {
    setEnergyConsumption(prev => ({
      ...prev,
      appliances: [...prev.appliances, { name: 'New Appliance', power: 1.0, hours: 4 }]
    }));
  };

  const updateAppliance = (index: number, field: string, value: any) => {
    setEnergyConsumption(prev => ({
      ...prev,
      appliances: prev.appliances.map((appliance, i) => 
        i === index ? { ...appliance, [field]: value } : appliance
      )
    }));
  };

  const removeAppliance = (index: number) => {
    setEnergyConsumption(prev => ({
      ...prev,
      appliances: prev.appliances.filter((_, i) => i !== index)
    }));
  };

  const exportReport = () => {
    const reportData = {
      location,
      energyData,
      battery,
      energyConsumption,
      costAnalysis,
      carbonFootprint,
      weatherData,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enershift-report-${location?.city || 'location'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report Exported",
      description: "Energy analysis report downloaded successfully",
    });
  };

  // Chart colors
  const COLORS = ['hsl(var(--energy-solar))', 'hsl(var(--energy-wind))', 'hsl(var(--energy-battery))', 'hsl(var(--energy-grid))'];

  const energyMixData = energyData ? [
    { name: 'Solar', value: energyData.solar.average, color: COLORS[0] },
    { name: 'Wind', value: energyData.wind.average, color: COLORS[1] },
    { name: 'Battery', value: battery.currentCharge / 10, color: COLORS[2] },
    { name: 'Grid', value: Math.max(0, energyConsumption.dailyDemand - energyData.solar.average - energyData.wind.average), color: COLORS[3] }
  ] : [];

  const savingsProjection = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(0, i).toLocaleString('default', { month: 'short' }),
    savings: costAnalysis.annualSavings / 12 * (i + 1)
  }));

  return (
    <div className="space-y-6">
      <Tabs defaultValue="consumption" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="consumption">Energy Consumption</TabsTrigger>
          <TabsTrigger value="cost">Cost Analysis</TabsTrigger>
          <TabsTrigger value="carbon">Carbon Impact</TabsTrigger>
          <TabsTrigger value="weather">Weather Integration</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
        </TabsList>

        {/* Energy Consumption Tab */}
        <TabsContent value="consumption" className="space-y-6">
          <Card className="glass-card p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold">Energy Consumption Tracking</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Daily Energy Demand (kWh)</label>
                    <Input
                      type="number"
                      value={energyConsumption.dailyDemand}
                      onChange={(e) => setEnergyConsumption(prev => ({ ...prev, dailyDemand: Number(e.target.value) }))}
                      min="1"
                      max="1000"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Peak Usage Hours</label>
                    <Input
                      value={energyConsumption.peakHours}
                      onChange={(e) => setEnergyConsumption(prev => ({ ...prev, peakHours: e.target.value }))}
                      placeholder="e.g., 18:00-22:00"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Energy Mix Distribution</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={energyMixData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value.toFixed(1)}kWh`}
                        >
                          {energyMixData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Appliance Breakdown</h4>
                  <Button onClick={addAppliance} size="sm">Add Appliance</Button>
                </div>

                <div className="space-y-3">
                  {energyConsumption.appliances.map((appliance, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-center p-3 rounded-lg bg-muted/50">
                      <div className="col-span-4">
                        <Input
                          value={appliance.name}
                          onChange={(e) => updateAppliance(index, 'name', e.target.value)}
                          placeholder="Appliance name"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          value={appliance.power}
                          onChange={(e) => updateAppliance(index, 'power', Number(e.target.value))}
                          placeholder="Power (kW)"
                          step="0.1"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          value={appliance.hours}
                          onChange={(e) => updateAppliance(index, 'hours', Number(e.target.value))}
                          placeholder="Hours/day"
                        />
                      </div>
                      <div className="col-span-1">
                        <p className="text-sm font-medium">{(appliance.power * appliance.hours).toFixed(1)} kWh</p>
                      </div>
                      <div className="col-span-1">
                        <Button onClick={() => removeAppliance(index)} variant="destructive" size="sm">×</Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-right">
                  <p className="text-lg font-semibold">
                    Total Daily Consumption: {energyConsumption.appliances.reduce((sum, app) => sum + (app.power * app.hours), 0).toFixed(1)} kWh
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Cost Analysis Tab */}
        <TabsContent value="cost" className="space-y-6">
          <Card className="glass-card p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-energy-solar" />
                <h3 className="text-xl font-semibold">Economic Analysis</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Grid Cost (₹/kWh)</label>
                    <Input
                      type="number"
                      value={costAnalysis.gridCost}
                      onChange={(e) => setCostAnalysis(prev => ({ ...prev, gridCost: Number(e.target.value) }))}
                      step="0.1"
                    />
                  </div>
                  
                  <div className="p-4 rounded-lg bg-energy-solar/10 border border-energy-solar/20">
                    <p className="text-sm text-muted-foreground">Daily Savings</p>
                    <p className="text-2xl font-bold text-energy-solar">₹{costAnalysis.renewableSavings.toFixed(0)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-energy-wind/10 border border-energy-wind/20">
                    <p className="text-sm text-muted-foreground">Annual Savings</p>
                    <p className="text-2xl font-bold text-energy-wind">₹{costAnalysis.annualSavings.toFixed(0)}</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-energy-battery/10 border border-energy-battery/20">
                    <p className="text-sm text-muted-foreground">Payback Period</p>
                    <p className="text-2xl font-bold text-energy-battery">{costAnalysis.paybackPeriod.toFixed(1)} years</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Savings Projection</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={savingsProjection}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }} 
                        />
                        <Bar dataKey="savings" fill="hsl(var(--energy-solar))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Carbon Impact Tab */}
        <TabsContent value="carbon" className="space-y-6">
          <Card className="glass-card p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-energy-battery" />
                <h3 className="text-xl font-semibold">Environmental Impact</h3>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-muted-foreground">Current Emissions</p>
                  <p className="text-xl font-bold text-destructive">{carbonFootprint.currentEmissions.toFixed(1)} kg CO₂/day</p>
                </div>
                
                <div className="p-4 rounded-lg bg-energy-battery/10 border border-energy-battery/20">
                  <p className="text-sm text-muted-foreground">Daily Reduction</p>
                  <p className="text-xl font-bold text-energy-battery">{carbonFootprint.renewableReduction.toFixed(1)} kg CO₂</p>
                </div>
                
                <div className="p-4 rounded-lg bg-energy-wind/10 border border-energy-wind/20">
                  <p className="text-sm text-muted-foreground">Annual Savings</p>
                  <p className="text-xl font-bold text-energy-wind">{carbonFootprint.annualSavings.toFixed(0)} kg CO₂</p>
                </div>
                
                <div className="p-4 rounded-lg bg-energy-solar/10 border border-energy-solar/20">
                  <p className="text-sm text-muted-foreground">Trees Equivalent</p>
                  <p className="text-xl font-bold text-energy-solar">{carbonFootprint.treesEquivalent.toFixed(0)} trees/year</p>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-gradient-to-r from-energy-battery/10 to-energy-solar/10 border border-energy-battery/20">
                <h4 className="font-semibold mb-2">Environmental Benefits</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Reduce carbon footprint by {((carbonFootprint.renewableReduction / carbonFootprint.currentEmissions) * 100).toFixed(0)}% daily</li>
                  <li>• Equivalent to planting {carbonFootprint.treesEquivalent.toFixed(0)} trees annually</li>
                  <li>• Save {(carbonFootprint.annualSavings / 1000).toFixed(1)} tonnes of CO₂ emissions per year</li>
                  <li>• Contribute to India's renewable energy goals</li>
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Weather Integration Tab */}
        <TabsContent value="weather" className="space-y-6">
          <Card className="glass-card p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CloudRain className="w-5 h-5 text-energy-wind" />
                <h3 className="text-xl font-semibold">Weather-Aware Energy Management</h3>
              </div>

              {weatherData && (
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-energy-solar" />
                      <p className="text-sm text-muted-foreground">Temperature</p>
                    </div>
                    <p className="text-xl font-bold">{weatherData.temperature}°C</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <p className="text-sm text-muted-foreground">Humidity</p>
                    <p className="text-xl font-bold">{weatherData.humidity}%</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <p className="text-sm text-muted-foreground">Cloud Cover</p>
                    <p className="text-xl font-bold">{weatherData.clouds}%</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <p className="text-sm text-muted-foreground">Condition</p>
                    <p className="text-xl font-bold">{weatherData.condition}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-semibold">Weather Impact Analysis</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-energy-solar/10 border border-energy-solar/20">
                    <h5 className="font-medium text-energy-solar mb-2">Solar Efficiency</h5>
                    <p className="text-sm">
                      {weatherData?.clouds && weatherData.clouds < 30 ? '🌞 Excellent' : 
                       weatherData?.clouds && weatherData.clouds < 60 ? '⛅ Good' : '☁️ Reduced'} conditions for solar generation
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-energy-wind/10 border border-energy-wind/20">
                    <h5 className="font-medium text-energy-wind mb-2">Wind Potential</h5>
                    <p className="text-sm">
                      Current wind speeds {energyData?.wind.current > 5 ? '🌪️ favor' : 
                                         energyData?.wind.current > 3 ? '💨 moderately support' : '🍃 limit'} wind generation
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Advanced Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card className="glass-card p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-semibold">Advanced Analytics & Reports</h3>
                </div>
                <Button onClick={exportReport} className="gap-2">
                  <Download className="w-4 h-4" />
                  Export Report
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">System Performance Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                      <span>Solar Capacity Factor</span>
                      <Badge variant="secondary">
                        {energyData ? ((energyData.solar.average / 8) * 100).toFixed(0) : 0}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                      <span>Wind Capacity Factor</span>
                      <Badge variant="secondary">
                        {energyData ? ((energyData.wind.average / 10) * 100).toFixed(0) : 0}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                      <span>Battery Efficiency</span>
                      <Badge variant="secondary">
                        {battery ? (95 - (battery.capacity > 100 ? 5 : 0)).toFixed(0) : 95}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                      <span>Grid Independence</span>
                      <Badge variant="secondary">
                        {energyData ? Math.min(100, ((energyData.solar.average + energyData.wind.average) / energyConsumption.dailyDemand * 100)).toFixed(0) : 0}%
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Optimization Opportunities</h4>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-energy-solar/10 border border-energy-solar/20">
                      <h5 className="font-medium text-energy-solar">Solar Optimization</h5>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add {((energyConsumption.dailyDemand - (energyData?.solar.average || 0)) / 5).toFixed(1)}kW panels 
                        for energy independence
                      </p>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-energy-battery/10 border border-energy-battery/20">
                      <h5 className="font-medium text-energy-battery">Battery Sizing</h5>
                      <p className="text-sm text-muted-foreground mt-1">
                        Optimal battery: {(energyConsumption.dailyDemand * 1.5).toFixed(0)}kWh 
                        for 36-hour backup
                      </p>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-energy-wind/10 border border-energy-wind/20">
                      <h5 className="font-medium text-energy-wind">Load Management</h5>
                      <p className="text-sm text-muted-foreground mt-1">
                        Shift {(energyConsumption.dailyDemand * 0.3).toFixed(1)}kWh to peak renewable hours
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedFeatures;