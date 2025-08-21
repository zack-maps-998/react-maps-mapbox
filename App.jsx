import React, { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import {
  Box, Grid, GridItem, Tabs, TabList, TabPanels, Tab, TabPanel,
  HStack, Text
} from '@chakra-ui/react'

import Filters from './components/Filters.jsx'
import MapView from './components/Mapview.jsx'
import Trends from './components/Trends.jsx'
import EventsTable from './components/EventsTable.jsx'

import eventsJson from './data/events.json'
import {
  normalizeEvents, hourlySeries, zScoreSeries
} from './utils/data.js'

export default function App() {
  // Normalize once
  const all = normalizeEvents(eventsJson)

  // Distinct facets for filters
  const [types] = useState([...new Set(all.map(e => e.type))].sort())
  const [deviceTypes] = useState([...new Set(all.map(e => e.deviceType).filter(Boolean))].sort())
  const [regions] = useState([...new Set(all.map(e => e.region).filter(Boolean))].sort())

  // Time window defaults to data min/max so you always see something
  const minTs = Math.min(...all.map(e => e.ts))
  const maxTs = Math.max(...all.map(e => e.ts))
  const [start, setStart] = useState(new Date(minTs).toISOString())
  const [end,   setEnd]   = useState(new Date(maxTs).toISOString())


  // Filters
  const [selectedTypes, setSelectedTypes] = useState([])
  const [selectedDeviceTypes, setSelectedDeviceTypes] = useState([])
  const [selectedRegions, setSelectedRegions] = useState([])
  const [tagQuery, setTagQuery] = useState('')
  const [minSev, setMinSev] = useState(1)
  const [maxSev, setMaxSev] = useState(5)
  const [showHeatmap, setShowHeatmap] = useState(false)

  // Keep severity sliders ordered
  const setMinSevClamped = (v) => {
    const n = Math.max(1, Math.min(5, Number(v)))
    setMinSev(n); if (n > maxSev) setMaxSev(n)
  }
  const setMaxSevClamped = (v) => {
    const n = Math.max(1, Math.min(5, Number(v)))
    setMaxSev(n); if (n < minSev) setMinSev(n)
  }

  // Apply filters
  const filtered = useMemo(() => {
    const s = dayjs(start).valueOf()
    const e = dayjs(end).valueOf()
    const tq = tagQuery.trim().toLowerCase()

    let out = all.filter(ev =>
      ev.ts >= s && ev.ts <= e &&
      ev.severity >= minSev && ev.severity <= maxSev &&
      (selectedTypes.length === 0 || selectedTypes.includes(ev.type)) &&
      (selectedDeviceTypes.length === 0 || selectedDeviceTypes.includes(ev.deviceType ?? '')) &&
      (selectedRegions.length === 0 || selectedRegions.includes(ev.region ?? '')) &&
      (tq === '' || (ev.tags || []).some(tag => tag.toLowerCase().includes(tq)))
    )

   
    return out.slice(0, 2000)
  }, [
    all, start, end, minSev, maxSev, selectedTypes,
    selectedDeviceTypes, selectedRegions, tagQuery
  ])

  // Trends
  const series = useMemo(
    () => zScoreSeries(hourlySeries(filtered)),
    [filtered]
  )

  return (
    <Grid templateColumns="280px 1fr" h="100vh">
      {/* Sidebar */}
      <GridItem borderRight="1px solid" borderColor="gray.200" p={3} overflow="auto">
        <Text fontSize="lg" fontWeight="semibold" mb={2}>Filters</Text>
        <Filters
          start={start} end={end} setStart={setStart} setEnd={setEnd}
          types={types} selectedTypes={selectedTypes} setSelectedTypes={setSelectedTypes}
          deviceTypes={deviceTypes} selectedDeviceTypes={selectedDeviceTypes} setSelectedDeviceTypes={setSelectedDeviceTypes}
          regions={regions} selectedRegions={selectedRegions} setSelectedRegions={setSelectedRegions}
          tagQuery={tagQuery} setTagQuery={setTagQuery}
          minSev={minSev} maxSev={maxSev} setMinSev={setMinSevClamped} setMaxSev={setMaxSevClamped}
          showHeatmap={showHeatmap} setShowHeatmap={setShowHeatmap}
          
        />

        <HStack mt={4} spacing={3}>
          <Box borderWidth="1px" p={2} rounded="lg" textAlign="center" w="full">
            <Text fontSize="xs" color="gray.500">Total</Text>
            <Text fontWeight="semibold">{filtered.length}</Text>
          </Box>
          <Box borderWidth="1px" p={2} rounded="lg" textAlign="center" w="full">
            <Text fontSize="xs" color="gray.500">Anomalies</Text>
            <Text fontWeight="semibold">{series.filter(p => p.isAnomaly).length}</Text>
          </Box>
        </HStack>
      </GridItem>

      {/* Main */}
      <GridItem minH={0} display="flex" flexDirection="column">
        <Tabs display="flex" flexDirection="column" h="100%">
          <TabList>
            <Tab>Map</Tab>
            <Tab>List ({filtered.length})</Tab>
            <Tab>Trends</Tab>
          </TabList>
          <TabPanels flex="1" minH={0}>
            <TabPanel p={0} h="100%"><Box h="100%"><MapView events={filtered} showHeatmap={showHeatmap} /></Box></TabPanel>
            <TabPanel p={0} h="100%"><EventsTable events={filtered} /></TabPanel>
            <TabPanel p={0}><Box h="360px"><Trends data={series} /></Box></TabPanel>
          </TabPanels>
        </Tabs>
      </GridItem>
    </Grid>
  )
}
