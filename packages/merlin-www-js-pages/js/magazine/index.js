'use strict';

import { default as initArticles } from './articles';
import { default as initCovers } from './covers';

export default function init(){
    initArticles();
    initCovers();
}
