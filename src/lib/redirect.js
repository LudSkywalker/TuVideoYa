module.exports={
    ingresado(req,res,next){
        if(req.isAuthenticated()){
            return next();
        }else{
            return res.redirect("/home")
        }
    },
    visitante(req,res,next){
        if(req.isAuthenticated()){
            return res.redirect("/muro")
        }else{
            return next();
        }
    }
}