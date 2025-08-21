import { useState ,useEffect} from 'react'
import dayjs from 'dayjs'
import { FormControl,FormLabel,RangeSlider,RangeSliderFilledTrack,RangeSliderTrack,RangeSliderThumb } from '@chakra-ui/react';
function Filter({startDate,endDate,setStartDate,setEndDate,minMag,maxMag,setMinMag,setMaxMag}) {



    return(
        <>
        <div>
            <h2>Filters</h2>
            <label htmlFor="start" >Start date</label>
            <input type="datetime-local" value={toInput(startDate)} className="start"  onChange={e=> setStartDate(fromInput(e.target.value))}/>
            <label htmlFor="end"  >End date</label>
            <input type="datetime-local" value={toInput(endDate)} className="end" onChange={e=>setEndDate(fromInput(e.target.value))}/>
        </div>
        <FormControl>
        <FormLabel>Magnitude {minMag}–{maxMag}</FormLabel>
        <RangeSlider min={1} max={5} step={1} value={[minMag, maxMag]}
          onChange={([lo, hi]) => { setMinMag(lo); setMaxMag(hi) }} minStepsBetweenThumbs={1} >
          <RangeSliderTrack><RangeSliderFilledTrack /></RangeSliderTrack>
          <RangeSliderThumb index={0} /><RangeSliderThumb index={1} />
        </RangeSlider>
      </FormControl>

      <FormControl>
        <FormLabel>Filter by type</FormLabel>

      </FormControl>
        </>
    )
}
export default Filter;

  const toInput = (v) => (dayjs.isDayjs(v) ? v.format('YYYY-MM-DDTHH:mm') : '')
  // input change -> keep Dayjs in state (null if cleared)
  const fromInput = (s) => (s ? dayjs(s) : null)