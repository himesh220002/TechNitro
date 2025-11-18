import { RouteEdge } from './types'

 const transportGraph: RouteEdge[] = [
  // ✈️ Flights
  { from: 'Mumbai', to: 'Delhi', mode: 'flight', distanceKm: 1400, timeHr: 2.2, costPerKm: 2.5 },
{ from: 'Mumbai', to: 'Kolkata', mode: 'flight', distanceKm: 1650, timeHr: 2.5, costPerKm: 2.4 },
{ from: 'Mumbai', to: 'Chennai', mode: 'flight', distanceKm: 1300, timeHr: 2.1, costPerKm: 2.3 },
{ from: 'Delhi', to: 'Bengaluru', mode: 'flight', distanceKm: 1700, timeHr: 2.6, costPerKm: 2.5 },
{ from: 'Delhi', to: 'Kolkata', mode: 'flight', distanceKm: 1500, timeHr: 2.3, costPerKm: 2.4 },
{ from: 'Delhi', to: 'Hyderabad', mode: 'flight', distanceKm: 1600, timeHr: 2.4, costPerKm: 2.3 },
{ from: 'Bengaluru', to: 'Hyderabad', mode: 'flight', distanceKm: 570, timeHr: 1.2, costPerKm: 2.6 },
{ from: 'Bengaluru', to: 'Mumbai', mode: 'flight', distanceKm: 980, timeHr: 1.8, costPerKm: 2.4 },
{ from: 'Chennai', to: 'Kolkata', mode: 'flight', distanceKm: 1350, timeHr: 2.2, costPerKm: 2.3 },
{ from: 'Ahmedabad', to: 'Delhi', mode: 'flight', distanceKm: 950, timeHr: 1.6, costPerKm: 2.2 },
{ from: 'Mumbai', to: 'Nagpur', mode: 'flight', distanceKm: 830, timeHr: 1.5, costPerKm: 2.8 },
  { from: 'Nagpur', to: 'Kolkata', mode: 'flight', distanceKm: 970, timeHr: 2, costPerKm: 2.7 },
  { from: 'Chennai', to: 'Visakhapatnam', mode: 'flight', distanceKm: 800, timeHr: 1.5, costPerKm: 2.8 },


  // 🚆 Trains
  { from: 'Kolkata', to: 'Patna', mode: 'train', distanceKm: 580, timeHr: 8, costPerKm: 1.0 },
{ from: 'Patna', to: 'Katihar', mode: 'train', distanceKm: 290, timeHr: 5.5, costPerKm: 1.1 },
{ from: 'Delhi', to: 'Lucknow', mode: 'train', distanceKm: 500, timeHr: 6.5, costPerKm: 1.0 },
{ from: 'Delhi', to: 'Jaipur', mode: 'train', distanceKm: 280, timeHr: 5, costPerKm: 1.2 },
{ from: 'Mumbai', to: 'Nagpur', mode: 'train', distanceKm: 830, timeHr: 12, costPerKm: 1.1 },
{ from: 'Mumbai', to: 'Surat', mode: 'train', distanceKm: 280, timeHr: 4.5, costPerKm: 1.0 },
{ from: 'Chennai', to: 'Bengaluru', mode: 'train', distanceKm: 360, timeHr: 6, costPerKm: 1.0 },
{ from: 'Hyderabad', to: 'Vijayawada', mode: 'train', distanceKm: 270, timeHr: 5, costPerKm: 1.1 },
{ from: 'Ahmedabad', to: 'Surat', mode: 'train', distanceKm: 270, timeHr: 4.5, costPerKm: 1.0 },
{ from: 'Kolkata', to: 'Guwahati', mode: 'train', distanceKm: 1000, timeHr: 18, costPerKm: 0.9 },
  { from: 'Kolkata', to: 'Patna', mode: 'train', distanceKm: 580, timeHr: 8, costPerKm: 1.1 },
  { from: 'Patna', to: 'Katihar', mode: 'train', distanceKm: 290, timeHr: 5.5, costPerKm: 1.4 },
  { from: 'Delhi', to: 'Varanasi', mode: 'train', distanceKm: 800, timeHr: 10, costPerKm: 0.9 },
  { from: 'Hyderabad', to: 'Nagpur', mode: 'train', distanceKm: 500, timeHr: 8, costPerKm: 1.2 },
  { from: 'Raipur', to: 'Ranchi', mode: 'train', distanceKm: 300, timeHr: 6, costPerKm: 1.7 },
  { from: 'Ahmedabad', to: 'Mumbai', mode: 'train', distanceKm: 520, timeHr: 7.5, costPerKm: 1.15 },
  { from: 'Pune', to: 'Hyderabad', mode: 'train', distanceKm: 560, timeHr: 9, costPerKm: 1.25 },
  { from: 'Bengaluru', to: 'Chennai', mode: 'train', distanceKm: 360, timeHr: 6, costPerKm: 1.1 },
  { from: 'Visakhapatnam', to: 'Bhubaneswar', mode: 'train', distanceKm: 450, timeHr: 7, costPerKm: 1.1 },
  { from: 'Kolkata', to: 'Siliguri', mode: 'train', distanceKm: 600, timeHr: 10, costPerKm: 1.0 },
  { from: 'Siliguri', to: 'Guwahati', mode: 'train', distanceKm: 450, timeHr: 8, costPerKm: 1.1 },
  { from: 'Delhi', to: 'Chandigarh', mode: 'train', distanceKm: 250, timeHr: 4, costPerKm: 1.4 },


  // 🚚 Trucks
  { from: 'Patna', to: 'Katihar', mode: 'truck', distanceKm: 290, timeHr: 6, costPerKm: 3.0 },
{ from: 'Nagpur', to: 'Raipur', mode: 'truck', distanceKm: 280, timeHr: 6, costPerKm: 3.2 },
{ from: 'Bhopal', to: 'Indore', mode: 'truck', distanceKm: 190, timeHr: 4, costPerKm: 3.0 },
{ from: 'Lucknow', to: 'Kanpur', mode: 'truck', distanceKm: 90, timeHr: 2, costPerKm: 3.5 },
{ from: 'Jaipur', to: 'Ajmer', mode: 'truck', distanceKm: 130, timeHr: 3, costPerKm: 3.2 },
{ from: 'Surat', to: 'Vadodara', mode: 'truck', distanceKm: 150, timeHr: 3.5, costPerKm: 3.0 },
{ from: 'Chennai', to: 'Coimbatore', mode: 'truck', distanceKm: 500, timeHr: 8, costPerKm: 2.8 },
{ from: 'Bengaluru', to: 'Mysuru', mode: 'truck', distanceKm: 150, timeHr: 3, costPerKm: 2.9 },
{ from: 'Kolkata', to: 'Durgapur', mode: 'truck', distanceKm: 170, timeHr: 3.5, costPerKm: 3.1 },
{ from: 'Delhi', to: 'Agra', mode: 'truck', distanceKm: 230, timeHr: 4.5, costPerKm: 3.0 },
{ from: 'Patna', to: 'Katihar', mode: 'truck', distanceKm: 290, timeHr: 6, costPerKm: 2.8 },
  { from: 'Varanasi', to: 'Patna', mode: 'truck', distanceKm: 250, timeHr: 5, costPerKm: 2.6 },
  { from: 'Nagpur', to: 'Raipur', mode: 'truck', distanceKm: 280, timeHr: 6, costPerKm: 2.7 },
  { from: 'Mumbai', to: 'Pune', mode: 'truck', distanceKm: 150, timeHr: 3, costPerKm: 2.5 },
  { from: 'Guwahati', to: 'Imphal', mode: 'truck', distanceKm: 490, timeHr: 10, costPerKm: 2.9 },
  { from: 'Chandigarh', to: 'Amritsar', mode: 'truck', distanceKm: 230, timeHr: 4.5, costPerKm: 2.6 }


]

export const bidirectionalGraph: RouteEdge[] = [
  ...transportGraph,
  ...transportGraph.map((edge) => ({
    from: edge.to,
    to: edge.from,
    mode: edge.mode,
    distanceKm: edge.distanceKm,
    timeHr: edge.timeHr,
    costPerKm: edge.costPerKm,
  })),
]