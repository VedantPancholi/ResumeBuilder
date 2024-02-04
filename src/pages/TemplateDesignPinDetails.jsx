import React from 'react'
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { getTemplateDetails } from '../api';

 const TemplateDesignPinDetails = () => {
  const { templateID } = useParams();

  const { data, isError, isLoading, reftch} = useQuery(
    ["template", templateID],
    () => getTemplateDetails(templateID)
  )

  return (
    <div>

    </div>
  )
}
export default TemplateDesignPinDetails;