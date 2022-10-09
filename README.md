# dynamic expose module for react:
dynamic expose, support 'IntersectionObserver' and 'Scroll',
基于window.IntersectionObserver 实现，摒弃scroll的方式，理论上性能会好一些。不用绑定很多的滚动监听，在不支持的环境里会降级成scroll，使用者不用担心兼容性问题
### lazy load example:
```
import Expose from 'lazy_load_react_images/es/Expose';

// images lazy load;
<Expose
  id={`songListimg_${index}`}
  className="mui_cell_list__img"
  src={'http://xxxx'}
/>
```
### dom dynamic expose:
```
import Expose from 'lazy_load_react_images/es/Expose';
// dom dynamic expose
<Expose
  id={'experienceofficer_lottery'}
  cb={() => {
    // expose callback
  }}
>
  <>
    <span>expose element</span>
  </>
</Expose>
```

### long list load more, scroll;
```
import LoadMore from 'lazy_load_react_images/es/LoadMore';

<LoadMore
  id="present_tab"
  loadText="loading..."
  overText={`${empty ? 'empty goods' : 'over'}`}
  isOver={isLogin === 'no' || hasMore === 0}
  loadMoreHandler={() => {
    // loadmore callback, you can query your next page list data;
    fetchMainData({ nextPos }).then(({ nextPos, normalList, hasMore }) => {
      // setState to make children change;
    });
  }}
>
  <ul className="mui_cell_list mod_other_gift">
    {presentList?.map(item => {
      const { id, name, pic, subTitle } = item;
      return (
        <li key={`${name}_${id}`} className="mui_cell_list__item">
          <div className="mui_cell_list__box">
            <div className="mui_cell_list__media">
              <img className="mui_cell_list__img" src={Music.fixUrl(pic)} alt={name} />
            </div>
            <div className="mui_cell_list__bd">
              <h3 className="mui_cell_list__tit c_txt1">{name}</h3>
              <p className="mui_cell_list__desc c_txt2">{subTitle}</p>
            </div>
            <UseButton presentInfo={item} />
          </div>
        </li>
      );
    })}
  </ul>
</LoadMore>
```