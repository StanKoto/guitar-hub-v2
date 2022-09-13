class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const handleErrors = (err, req, res, next) => {
  console.log(err.message);
  let errors = { 
    username: '', 
    email: '', 
    password: '', 
    credentials: '', 
    token: '', 
    title: '', 
    contents: '',
    category: '', 
    images: '', 
    rating: ''
  };

  if (err.parent && err.parent.code === '23505') {
    if (err.parent.constraint === 'ratings_tip_id_reviewer_id') {
      errors.rating = 'You have already rated this tip';
    } else {
      const errorField = err.parent.constraint.split('_')[1];
      errors[errorField] = `That ${errorField} is already registered`;
    }
    return res.status(400).json({ errors });
  }

  if (err.name === 'SequelizeValidationError') {
    for (const validationErrorItem of err.errors) {
      errors[validationErrorItem.path] = validationErrorItem.message;
    }
    return res.status(400).json({ errors });
  }
  
  if (err.parent && err.parent.code === '22P02') { 
    err = new ErrorResponse(`Resource not found with ID of ${err.message.split(': ')[1]}`, 404);
  }

  if (err.statusCode) {
    if (req.method === 'GET') {
      return res.status(err.statusCode).render('errorViews/userError', { title: err.statusCode.toString(), message: err.message });
    }
    return res.status(err.statusCode).json({ otherErrors: true, message: err.message });
  }

  switch (err.message) {
    case 'Invalid credentials':
      errors.credentials = 'Invalid credentials, please check your email and password and try again';
      return res.status(400).json({ errors });
    case 'Username required':
      errors.username = 'Please provide a username';
      return res.status(400).json({ errors });
    case 'Email required':
      errors.email = 'Please provide an email';
      return res.status(400).json({ errors });
    case 'Invalid email':
      errors.email = 'Incorrect email, please try again';
      return res.status(400).json({ errors });
    case 'Password required':
      errors.password = 'Please provide a password';
      return res.status(400).json({ errors });
    case 'Invalid password':
      errors.credentials = 'Incorrect password, please try again';
      return res.status(400).json({ errors });
    case 'Invalid token':
      errors.token = 'This token is invalid or has already expired, please go to the auth page and request another token!';
      return res.status(400).json({ errors });
    case 'Own tip rated':
      errors.rating = 'You cannot rate your own tips';
      return res.status(401).json({ errors });
    case 'Not an image':
      errors.images = 'Please select only image files formatted as JPEG or PNG';
      return res.status(400).json({ errors });
    case 'Duplicate image':
      errors.images = 'You have already uploaded one or more of these images, please sort the duplicates out and try again';
      return res.status(400).json ({ errors });
    case 'File too large':
      errors.images = 'Please only upload files not larger than 2 MBs';
      return res.status(400).json({ errors });
    case 'Unexpected field':
      errors.images = 'The number of selected images exceeeds the limit of 10, please select less images';
      return res.status(400).json({ errors });
    default:
      console.error(err);
      if (req.method === 'GET') return res.status(500).redirect('/errors/server-error');
      res.status(500).json({ otherErrors: true });
  }
};

export { ErrorResponse, handleErrors };