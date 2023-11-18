declare module '#current-module' {
    namespace $$namespace$$ {
        import mongoose from 'mongoose';
        $$types$$;
        $$names$$;
        $$results$$;
    }

    export const Model: $$namespace$$.$$currentModelName$$Model;
    export const Models: {
        [key in $$namespace$$.ModelName]: (
            callback?: () => Promise<$$namespace$$.ResultModel<key>>
        ) => Promise<$$namespace$$.ResultModel<key>>;
    };
}
