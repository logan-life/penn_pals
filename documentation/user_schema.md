# Main Schema: User

```schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        require: true
    },
    security_question: {
        type: String,
    }, 
    security_answer:{
        type: String,
    },
    avatar: {
        type: String,  
    }, 
    register_time: {
        type: Date,
        default: Date.now
    },
    active_status: {
        type: Boolean,
    },
    online: {
        type: Boolean,  
    },
    attempts_with_wrong_password: {
        type: Number,
    },
    locked_out_until: {
        type: Date
    },
    contacts: [contactSchema],
    status: [statusSchema]
});
```

# Child Schema 1: Contacts

```
const contactSchema = new mongoose.Schema({
    username: {
        type: String
    },
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    avatar: {
        type: String
    },
    conversation_sid: {
        type: String
    },
    hidden: {
        type: Boolean,
    },
    status_id: {
        type: String   
    },
    status_seen: {
        type: Boolean,
    }     
});
```

# Child Schema 2: Status

```
const statusSchema = new mongoose.Schema({
    username: {
        type: String
    },
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    type:{
        type: String
    },
    text: {
        type: String
    },
    image: {
        type: String
    },
    url: {
        type: String
    },
    upload_time: {
        type: Date
    }
})
```