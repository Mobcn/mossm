namespace $$namespace$$ {
    import mongoose from 'mongoose';
    $$types$$;
    $$names$$;
    $$results$$;
}

declare const Model: $$namespace$$.$$currentModelName$$Model;
declare const Models: {
    [key in $$namespace$$.ModelName]: (
        callback?: () => Promise<$$namespace$$.ResultModel<key>>
    ) => Promise<$$namespace$$.ResultModel<key>>;
};
