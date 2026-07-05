

const parseContact=(contact)=>{
    let photo=contact.profilePicture
    if (!photo.startsWith("http") && photo) {
        photo = process.env.BACKEND_HOST + photo
    }
    return {
        id:contact._id,
        receiveCall:contact.receiveCall,
        receivePushNotification:contact.receivePushNotification,
        receiveSMS:contact.receiveSMS,
        isPrimary:contact.isPrimary,
        profilePicture:photo,
        email:contact.email,
        relationship:contact.relationship,
        phone:contact.phone,
        name:contact.name,
        userId:contact.userId

    }
}
const ParseContacts=(contacts)=>{
    const parsed=[]

    for(let i=0;i<contacts.length;i++){
        parsed.push(parseContact(contacts[i]))
    }
    return parsed
}

module.exports={ParseContacts,parseContact}