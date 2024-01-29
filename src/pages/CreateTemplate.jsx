import React, { useEffect, useState } from 'react'
import { FaTrash, FaUpload } from 'react-icons/fa6';
import { PuffLoader } from 'react-spinners';
import { toast } from 'react-toastify';

import {deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable} from "firebase/storage"
import { adminIds, initialTags } from '../utils/helpers';
// import { useAsyncError } from 'react-router-dom';
import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import useTemplates from '../hooks/useTemplates';
import { db, storage } from '../config/firebase.config';
import useUser from "../hooks/useUser";
import { useNavigate } from 'react-router-dom';
// import { storage } from "../config/firebase.config"

// const storage = getStorage();

 const CreateTemplate = () => {
  const[formData, setFormData] = useState({
    title : "",
    imageURL : null,
  });

  const [imageAsset, setImageAsset] = useState({
    isImageLoading : false,
    uri : null,
    progress : 0,
  });

  const [selectedTags, setSelectedTags] = useState([]);

  const {
    data : templates, 
    isError: templatesIsError, 
    isLoading: templatesIsLoading, 
    refetch: templatesReftch, 
  } = useTemplates();

  const {data : user, isLoading} = useUser()

  const navigate = useNavigate();

// handling the input field change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevRec) => ({ ...prevRec, [name] : value}));
  };

  // file changes
  const handleFileSelect = async (e) => {
    setImageAsset((prevAsset) =>({ ...prevAsset, isImageLoading: true }))
    const file = e.target.files[0];
    // console.log(file);

    if(file && isAllowed(file)){
      const storageRef = ref(storage, `Templates/${Date.now()}-${file.name}`);

      // const storageRef = ref( storage, 'Templates/${Date.now()}-$(file.name}');
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
         (snapshot) => {
            setImageAsset((prevAsset) => ({ 
              ...prevAsset, 
              progress : (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
            }));
         }, 
         (error) => {
          if(error.message.includes("storage/unauthorized")){
            toast.error('Error : Authorization Revoked')
          }else{
            toast.error('Error : ${error.message}')
          }
         },
         () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            // (snapshot) => {
              setImageAsset((prevAsset) => ({ 
                ...prevAsset, 
                uri: downloadURL,}));
          //  }
          });
         });
         toast.success("Image Uploaded");
         setInterval(() => {
          setImageAsset((prevAsset) => ({ ...prevAsset, isImageLoading: false}));
         }, 2000);

        //  setTimeout(() => {
        //   setImageAsset((prevAsset) => ({ ...prevAsset, isImageLoading: false }));
        // }, 3000); // Replace 3000 with your desired interval in milliseconds
        
    }else{
      toast.info("Invalid file format");
    }
  };
  
  const delelteAnImageObject = async() => {
    // setImageAsset((prevAsset) =>({ ...prevAsset, isImageLoading: true }));
    
    setInterval(() => {
      setImageAsset((prevAsset) => ({ 
        ...prevAsset, 
        progress: 0,
        uri: null,
        // isImageLoading: false, 
      }));
    }, 2000);
    const deleteRef = ref(storage, imageAsset.uri);
    deleteObject(deleteRef).then(() => {
    toast.success("Image removed");
    });
  };


  const isAllowed = (file) => {
    const allowedTypes  =["image/jpeg", "image/jpg", "image/png"];
    return allowedTypes.includes(file.type);
  };

  const handleSelectedTags = (tag) => {
    if(selectedTags.includes(tag)){
      //if selected than remove it
      setSelectedTags(selectedTags.filter(selected => selected !== tag));
    }else{
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const pushToCloud = async () => {
    const timestamp = serverTimestamp()
    const id = `${Date.now()}`
    const _doc = {
      _id : id,
      title : formData.title,
      imageURL : imageAsset.uri,
      tags : selectedTags,
      name : templates && templates.length > 0 
        ? `Template${templates.length + 1}` 
        : "Template1",
      timestamp : timestamp,
    };
    console.log(_doc);
    await setDoc(doc(db, "templates", id), _doc).then(() => {
      setFormData((prevData) => ({...prevData, title: "", imageURL: ""}));
      setImageAsset((prevAsset) => ({...prevAsset, uri: null}));
      setSelectedTags([]);
      templatesReftch();
      toast.success("Data pushed to the cloud");
    }).catch(error => {
      toast.error(`Error : ${error.message}`);
    })

  };

  const removeTemplate = async(template) => {
    const deleteRef = ref(storage, template?.imageURL)
    await deleteObject(deleteRef).then(async() => {
      await deleteDoc(doc(db, "templates", template?._id)).then(() => {
        toast.success("Template deleted from Cloud")
        templatesReftch()
      }).catch((err) => {
        
        toast.error(`Error : ${err.message}`);
      })
    });
  };

  useEffect(() => {
    if (!isLoading && !adminIds.includes(user?.uid)) {
      navigate("/", { replace: true });
    }
  }, [user, isLoading]);

  return (
    <div className='w-full px-4 lg:px-10 2xl:px-32 py-4 grid grod-col-4 lg:grid-cols-12'>

    {/* left container */}
    <div className='col-span-12 lg:col-span-4 2xl:col-span-3 w-full flex-1 flex items-center justify-start flex-col gap-4 px-2'>
      <div className='w-full'>
        <p className='text-lg text-txtPrimary'>Create a New Template</p>
      </div>

      {/*template ID section */}
      <div className="w-full flex items-center justify-end">
          <p className="text-base text-txtLight uppercase font-semibold">
            TempId :{" "}
          </p>
          <p className="text-sm text-txtDark capitalize font-bold">
            {templates && templates.length > 0
              ? `Template${templates.length + 1}`
              : "Template1"}
          </p>
        </div>

      {/* template title section */}
      <input className='w-full px-3 py-3 rounded-md bg-transparent border border-gray-300 text-lg text-txtPrimary focus:text-txtDark focus:shadow-md outline-none'
      type='text' name='title' placeholder='Template Title' value={formData.title} onChange={handleInputChange} />

      {/* file uploader section */}
      <div className='w-full bg-gray-100 backdrop-blur-md h-[420px] lg:h-[620px] 2xl:h-[740px] rounded-md broder-2 border-dotted border-gray-300 cursor-pointer flex items-center justify-center'>
        {imageAsset.isImageLoading 
        ? (<React.Fragment>
          <div className='flex flex-col items-center justify-center gap-4'>
            <PuffLoader color='#498FCD' size={40}/>
            <p>{imageAsset?.progress.toFixed(2)}%</p>
          </div>
        </React.Fragment>) 

        : (<React.Fragment>
            {!imageAsset?.uri ? (
              <React.Fragment>
                <label className='w-full cursor-pointer h-full'>
                  <div className='flex flex-col items-center justify-center h-full w-full'>
                    <div className='flex items-center justify-center flex-col gap-4'>
                      <FaUpload className='tetx-3xl' />
                      <p className='text-lg text-txtLight'>Click to Upload</p>
                    </div>
                  </div>

                  <input type='file' className='w-0 h-0' accept='.jpeg, .jpg, .png' onChange={handleFileSelect}/>
                </label>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <div className='relative w-full h-full overflow-hidden rounded-md '>
                  <img src={imageAsset?.uri} 
                  className='w-full h-full object-cover' 
                  loading='lazy' alt=''></img>

                  {/* delete image section */}
                  <div className='absolute top-4 right-4 w-8 h-8 rounded-md flex items-center justify-center bg-red-400 cursor-pointer' onClick={delelteAnImageObject}>
                    <FaTrash className='text-sm text-white' />
                  </div>

                </div>
              </React.Fragment>
            )}
        </React.Fragment>)}
      </div>

      {/* tag list */}

      <div className="w-full flex items-center flex-wrap gap-2">
          {initialTags.map((tag, i) => (
            <div
              key={i}
              className={`border border-gray-300 px-2 py-1 rounded-md cursor-pointer ${
                selectedTags.includes(tag) ? "bg-blue-700 text-white" : ""
              }`}
              onClick={() => handleSelectedTags(tag)}
            >
              <p className="text-xs">{tag}</p>
            </div>
          ))}
        </div>

      {/* button action */}
      <button type='button' className='w-full bg-blue-700 text-white rounded-md py-3' onClick={pushToCloud}>
        SAVE
      </button>
    </div>

    {/* right container */}
    <div className='col-span-12 lg:col-span-8 2xl:col-span-9 px-2 w-full flex-1 py-4'>
            {templatesIsLoading ? (
              <React.Fragment>
                <div className='w-full h-full flex items-center justify-center'>
                  <PuffLoader color='#498FCD' size={40}/>
                </div>
              </React.Fragment>
            ) : (
              <React.Fragment>
            {templates && templates.length > 0 ? (
              <React.Fragment>
                <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
                  {templates?.map((template) => (
                    <div
                      key={template._id}
                      className="w-full h-[500px] rounded-md overflow-hidden relative"
                    >
                      <img
                        src={template?.imageURL}
                        alt=""
                        className="w-full h-full object-cover"
                      />

                      <div
                        className="absolute top-4 right-4 h-8 w-8 rounded-md flex items-center justify-center bg-red-500 cursor-pointer"
                        onClick={() => removeTemplate(template)}
                      >
                        <FaTrash className="text-sm text-white"></FaTrash>
                      </div>
                    </div>
                  ))}
                </div>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <PuffLoader color="#498FCD" size={40} />
                  <p className="text-xl tracking-wider capitalize text-txtPrimary">
                    No data
                  </p>
                </div>
              </React.Fragment>
            )}
          </React.Fragment>
            )}
      </div>
    </div>
  )
}
export default CreateTemplate;