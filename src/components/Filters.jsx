import React, { useState } from 'react'
import {MdLayersClear} from "react-icons/md"
import {AnimatePresence, motion} from "framer-motion"
import { slideUpDownWithScale } from '../animation';
import { FiltersData } from '../utils/helpers';
import useFilters from '../hooks/useFilters';
import { useQueryClient } from 'react-query';

 const Filters = () => {
    const [isClearHovered, setIsClearHovered] = useState(false);

    const { data: filterData, isLoading, isError} = useFilters();

    const queryClient = useQueryClient();

    const handleFilterValue = (value) => {
      // const previousState = queryClient.getQueryData("globalFilter");
      // const updatedState = {...previousState, searchTerm : value}
      // queryClient.setQueryData("globalFilter", updatedState)

      queryClient.setQueryData("globalFilter", {
        ...queryClient.getQueryData("globalFilter"),
        searchTerm : value,
      })
    };

  return (
    <div className='w-full flex items-center justify-start py-4'>
        <div className='border border-gray-300 rounded-md px-3 py-2 mr-2 cursor-pointer group hover:shadow-md bg-gray-200 relative' 
        onMouseEnter={() => setIsClearHovered(true)}
        onMouseLeave={() => setIsClearHovered(false)}
        >
            <MdLayersClear className='text-xl'/>

            <AnimatePresence>
            {isClearHovered && (<motion.div 
                {...slideUpDownWithScale}
                className='absolute -top-8 -left-2 bg-white shadow-md rounded-md px-2 py-1'>
                    <p className='whitespace-nowrap text-xs'>Clear All</p>
                </motion.div>)}
                
            </AnimatePresence>
        </div>
        <div className='w-full flex items-center justify-start overflow-x-scroll gap-6 scrollbar-none'>
              {FiltersData && FiltersData.map((item) => (
                <div 
                onClick={() => handleFilterValue(item.value)}
                key={item.id} className={`border border-gray-300 rounded-md py-2 px-2 cursor-pointer group hover:shadow-md ${filterData.searchTerm === item.value && "bg-gray-300 shadow-md"}`}>
                  <p className='text-sm text-txtPrimary group-hover:text-txtDark whitespace-nowrap'> {item.label} </p>
                </div>
              ))}
        </div>
    </div>
  )
}
export default Filters;