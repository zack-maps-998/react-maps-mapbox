// 1. Import *useState* and *useEffect*
import React, {useState, useEffect, useMemo} from 'react';
import { Stack, HStack, VStack,Box,Grid,GridItem } from '@chakra-ui/react'
import './App.css';
import {preprocessData} from './filters.js'
import MapView from './MapView.jsx';
import Filter from './Filter.jsx';
import dayjs from 'dayjs';
function App() {
    
  let [data, setdata] = useState()
  

  useEffect(() => {
    fetch("https://eonet.gsfc.nasa.gov/api/v3/events?category=wildfires&status=open&days=7")
    .then(response => response.json())
    .then(data => setdata(data))
  },[])
// console.log(data);


const events=preprocessData(data)

const minTs = Math.min(...events.map(e => e.ts))
  const maxTs = Math.max(...events.map(e => e.ts))
  const [startDate, setStartDate] = useState(null)
const [endDate, setEndDate] = useState(null)

const minMg = Math.min(...events.map(e => e.mag))
  const maxMg = Math.max(...events.map(e => e.mag))
const [minMag,setMinMag] = useState(minMg)
  const [maxMag,setMaxMag] = useState(maxMg)


useEffect(() => {
  if (!events?.length) return;

  const times = events.map(e => e.ts ?? e.time ?? e.date).map(t => +new Date(t)).filter(Number.isFinite);
  if (!times.length) return;

  const min = Math.min(...times), max = Math.max(...times);

  // Only set the first time (or if still null). Won’t clobber user changes.
  setStartDate(prev => prev ?? dayjs(min).startOf('day'));
  setEndDate(prev   => prev ?? dayjs(max).endOf('day'));
}, [events]);

const filteredEvents = useMemo(() => {
  // Build inclusive local-day boundaries
  
  const startMs = startDate ? dayjs(startDate).startOf("day").valueOf() : Number.NEGATIVE_INFINITY;
  const endMs   = endDate   ? dayjs(endDate).endOf("day").valueOf()   : Number.POSITIVE_INFINITY;

  return events.filter((event) => {
    // Pick your time field; adjust if yours is event.iso/event.ts/etc.
    const t = dayjs(event.date).valueOf();
    if (!Number.isFinite(t)) return false;
    return t >= startMs && t <= endMs;  // inclusive
  });
}, [events, startDate, endDate]);

  return (
    <div className="App">
      <h1>Wildfire Events in the Last 7 Days</h1>
 <Grid
  templateColumns={{ base: "1fr", md: "320px 1fr" }} // 320px sidebar on md+
  gap={3}
  h="100vh"
>
  <GridItem>
    <Box p={4} h="100%" overflowY="auto">
      <Filter startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate} minMag={minMag} maxMag={maxMag} setMinMag={setMinMag} setMaxMag={setMaxMag}></Filter>
    </Box>
  </GridItem>

  <GridItem>
    <Box h="100%" minW={0}>
      <MapView events={filteredEvents} />
    </Box>
  </GridItem>
</Grid>


    </div>
  );
}

export default App;