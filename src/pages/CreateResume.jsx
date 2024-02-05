import React from 'react'
import { Route, Routes } from 'react-router-dom';
import { TemplatesData } from '../utils/helpers';

 const CreateResume = () => {
  return (
    <div className='w-full flex flex-col items-center justify-center py-4 '>
      <Routes>
        {TemplatesData.map(template => (
          <Route key={template?.id} path={`/${template.name}`} Component={template.component}></Route>
        ))}
      </Routes>
    </div>
  )
}
export default CreateResume;