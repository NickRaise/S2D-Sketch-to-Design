import { Request, Response, Router } from "express";

const router: Router = Router();

router.post("/register", (req: Request, res: Response) => {
  const { email, password } = req.body;

  // if email in db throw error

  // hash password

  // save user to db


  // set the token in cookie

  // send success response
});

router.post("/login", (req: Request, res: Response) => {
    const { email, password } = req.body;

    // find user by email

    // if user not found throw error

    // compare password

    // throw error if password does not match

    // set the token in cookie

    // send success response
});

export const authRouter = router;
