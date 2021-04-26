const helper = {
    validarNumero(number){
        if(number.typeof !== 'string'){
            number = number.toString();
        }
        number = number.replace('@c.us', '');
        if(number.length === 13 && number.charAt(0) !== '0') {
            // Suponemos que el numero es correcto, y empieza con el 548, sin 0 al inicio y 14 entre la caract. y el nro.
            return `${number}@c.us`;
        } else { 
            if(number.length === 10){
                // Suponemos que el numero está formateado correctamente pero sin el prefijo 549: código de area | número
                return `549${number}@c.us`;
                
            }
            return false;
        }
    },
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

};

module.exports = helper;
