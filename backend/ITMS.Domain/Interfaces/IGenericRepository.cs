using ITMS.Domain.Entities;

namespace ITMS.Domain.Interfaces;

public interface IGenericRepository<T> where T : BaseEntity
{
    T? GetById(int id);
    List<T> GetAll();
    void Add(T entity);
    void Update(T entity);
    void Delete(int id);
}
